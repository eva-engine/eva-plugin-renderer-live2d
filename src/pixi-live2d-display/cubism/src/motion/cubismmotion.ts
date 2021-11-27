/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMath } from '../math/cubismmath';
import { CubismModel } from '../model/cubismmodel';
import { CSM_ASSERT, CubismLogDebug } from '../utils/cubismdebug';
import { ACubismMotion } from './acubismmotion';
import {
  CubismMotionCurve,
  CubismMotionCurveTarget,
  CubismMotionData,
  CubismMotionEvent,
  CubismMotionPoint,
  CubismMotionSegment,
  CubismMotionSegmentType,
} from './cubismmotioninternal';
import { CubismMotionJson } from './cubismmotionjson';
import { CubismMotionQueueEntry } from './cubismmotionqueueentry';

const EffectNameEyeBlink = 'EyeBlink';
const EffectNameLipSync = 'LipSync';
const TargetNameModel = 'Model';
const TargetNameParameter = 'Parameter';
const TargetNamePartOpacity = 'PartOpacity';

function lerpPoints(
  a: CubismMotionPoint,
  b: CubismMotionPoint,
  t: number,
): CubismMotionPoint {
  const result: CubismMotionPoint = new CubismMotionPoint();

  result.time = a.time + (b.time - a.time) * t;
  result.value = a.value + (b.value - a.value) * t;

  return result;
}

function linearEvaluate(points: CubismMotionPoint[], time: number): number {
  let t: number = (time - points[0].time) / (points[1].time - points[0].time);

  if (t < 0.0) {
    t = 0.0;
  }

  return points[0].value + (points[1].value - points[0].value) * t;
}

function bezierEvaluate(points: CubismMotionPoint[], time: number): number {
  let t: number = (time - points[0].time) / (points[3].time - points[0].time);

  if (t < 0.0) {
    t = 0.0;
  }

  const p01: CubismMotionPoint = lerpPoints(points[0], points[1], t);
  const p12: CubismMotionPoint = lerpPoints(points[1], points[2], t);
  const p23: CubismMotionPoint = lerpPoints(points[2], points[3], t);

  const p012: CubismMotionPoint = lerpPoints(p01, p12, t);
  const p123: CubismMotionPoint = lerpPoints(p12, p23, t);

  return lerpPoints(p012, p123, t).value;
}

function steppedEvaluate(points: CubismMotionPoint[], time: number): number {
  return points[0].value;
}

function inverseSteppedEvaluate(
  points: CubismMotionPoint[],
  time: number,
): number {
  return points[1].value;
}

function evaluateCurve(
  motionData: CubismMotionData,
  index: number,
  time: number,
): number {
  // Find segment to evaluate.
  const curve: CubismMotionCurve = motionData.curves[index];

  let target = -1;
  const totalSegmentCount: number =
    curve.baseSegmentIndex + curve.segmentCount;
  let pointPosition = 0;
  for (let i: number = curve.baseSegmentIndex; i < totalSegmentCount; ++i) {
    // Get first point of next segment.
    pointPosition =
      motionData.segments[i].basePointIndex +
      (motionData.segments[i].segmentType ==
      CubismMotionSegmentType.CubismMotionSegmentType_Bezier
        ? 3
        : 1);

    // Break if time lies within current segment.
    if (motionData.points[pointPosition].time > time) {
      target = i;
      break;
    }
  }

  if (target == -1) {
    return motionData.points[pointPosition].value;
  }

  const segment: CubismMotionSegment = motionData.segments[target];

  return segment.evaluate(
    motionData.points.slice(segment.basePointIndex),
    time,
  );
}

/**
 * モーションクラス
 *
 * モーションのクラス。
 */
export class CubismMotion extends ACubismMotion {
  /**
   * インスタンスを作成する
   *
   * @param json motion3.jsonが読み込まれているバッファ
   * @param onFinishedMotionHandler モーション再生終了時に呼び出されるコールバック関数
   * @return 作成されたインスタンス
   */
  public static create(json: CubismSpec.MotionJSON, onFinishedMotionHandler?: (self: ACubismMotion) => void): CubismMotion {
    const ret = new CubismMotion();

    ret.parse(json);
    ret._sourceFrameRate = ret._motionData.fps;
    ret._loopDurationSeconds = ret._motionData.duration;
    ret._onFinishedMotion = onFinishedMotionHandler;

    // NOTE: Editorではループありのモーション書き出しは非対応
    // ret->_loop = (ret->_motionData->Loop > 0);
    return ret;
  }

  /**
   * モデルのパラメータの更新の実行
   * @param model             対象のモデル
   * @param userTimeSeconds   現在の時刻[秒]
   * @param fadeWeight        モーションの重み
   * @param motionQueueEntry  CubismMotionQueueManagerで管理されているモーション
   */
  public doUpdateParameters(
    model: CubismModel,
    userTimeSeconds: number,
    fadeWeight: number,
    motionQueueEntry: CubismMotionQueueEntry,
  ): void {
    if (this._modelCurveIdEyeBlink == null) {
      this._modelCurveIdEyeBlink = EffectNameEyeBlink;
    }

    if (this._modelCurveIdLipSync == null) {
      this._modelCurveIdLipSync = EffectNameLipSync;
    }

    let timeOffsetSeconds: number =
      userTimeSeconds - motionQueueEntry.getStartTime();

    if (timeOffsetSeconds < 0.0) {
      timeOffsetSeconds = 0.0; // エラー回避
    }

    let lipSyncValue: number = Number.MAX_VALUE;
    let eyeBlinkValue: number = Number.MAX_VALUE;

    //まばたき、リップシンクのうちモーションの適用を検出するためのビット（maxFlagCount個まで
    const MaxTargetSize = 64;
    let lipSyncFlags = 0;
    let eyeBlinkFlags = 0;

    //瞬き、リップシンクのターゲット数が上限を超えている場合
    if (this._eyeBlinkParameterIds.length > MaxTargetSize) {
      CubismLogDebug(
        'too many eye blink targets : {0}',
        this._eyeBlinkParameterIds.length,
      );
    }
    if (this._lipSyncParameterIds.length > MaxTargetSize) {
      CubismLogDebug(
        'too many lip sync targets : {0}',
        this._lipSyncParameterIds.length,
      );
    }

    const tmpFadeIn: number =
      this._fadeInSeconds <= 0.0
        ? 1.0
        : CubismMath.getEasingSine(
        (userTimeSeconds - motionQueueEntry.getFadeInStartTime()) /
        this._fadeInSeconds,
        );

    const tmpFadeOut: number =
      this._fadeOutSeconds <= 0.0 || motionQueueEntry.getEndTime() < 0.0
        ? 1.0
        : CubismMath.getEasingSine(
        (motionQueueEntry.getEndTime() - userTimeSeconds) /
        this._fadeOutSeconds,
        );
    let value: number;
    let c: number, parameterIndex: number;

    // 'Repeat' time as necessary.
    let time: number = timeOffsetSeconds;

    if (this._isLoop) {
      while (time > this._motionData.duration) {
        time -= this._motionData.duration;
      }
    }

    const curves: CubismMotionCurve[] = this._motionData.curves;

    // Evaluate model curves.
    for (
      c = 0;
      c < this._motionData.curveCount &&
      curves[c].type ==
      CubismMotionCurveTarget.CubismMotionCurveTarget_Model;
      ++c
    ) {
      // Evaluate curve and call handler.
      value = evaluateCurve(this._motionData, c, time);

      if (curves[c].id == this._modelCurveIdEyeBlink) {
        eyeBlinkValue = value;
      } else if (curves[c].id == this._modelCurveIdLipSync) {
        lipSyncValue = value;
      }
    }

    let parameterMotionCurveCount = 0;

    for (
      ;
      c < this._motionData.curveCount &&
      curves[c].type ==
      CubismMotionCurveTarget.CubismMotionCurveTarget_Parameter;
      ++c
    ) {
      parameterMotionCurveCount++;

      // Find parameter index.
      parameterIndex = model.getParameterIndex(curves[c].id);

      // Skip curve evaluation if no value in sink.
      if (parameterIndex == -1) {
        continue;
      }

      const sourceValue: number = model.getParameterValueByIndex(
        parameterIndex,
      );

      // Evaluate curve and apply value.
      value = evaluateCurve(this._motionData, c, time);

      if (eyeBlinkValue != Number.MAX_VALUE) {
        for (
          let i = 0;
          i < this._eyeBlinkParameterIds.length && i < MaxTargetSize;
          ++i
        ) {
          if (this._eyeBlinkParameterIds[i] == curves[c].id) {
            value *= eyeBlinkValue;
            eyeBlinkFlags |= 1 << i;
            break;
          }
        }
      }

      if (lipSyncValue != Number.MAX_VALUE) {
        for (
          let i = 0;
          i < this._lipSyncParameterIds.length && i < MaxTargetSize;
          ++i
        ) {
          if (this._lipSyncParameterIds[i] == curves[c].id) {
            value += lipSyncValue;
            lipSyncFlags |= 1 << i;
            break;
          }
        }
      }

      let v: number;

      // パラメータごとのフェード
      if (curves[c].fadeInTime < 0.0 && curves[c].fadeOutTime < 0.0) {
        // モーションのフェードを適用
        v = sourceValue + (value - sourceValue) * fadeWeight;
      } else {
        // パラメータに対してフェードインかフェードアウトが設定してある場合はそちらを適用
        let fin: number;
        let fout: number;

        if (curves[c].fadeInTime < 0.0) {
          fin = tmpFadeIn;
        } else {
          fin =
            curves[c].fadeInTime == 0.0
              ? 1.0
              : CubismMath.getEasingSine(
              (userTimeSeconds - motionQueueEntry.getFadeInStartTime()) /
              curves[c].fadeInTime,
              );
        }

        if (curves[c].fadeOutTime < 0.0) {
          fout = tmpFadeOut;
        } else {
          fout =
            curves[c].fadeOutTime == 0.0 ||
            motionQueueEntry.getEndTime() < 0.0
              ? 1.0
              : CubismMath.getEasingSine(
              (motionQueueEntry.getEndTime() - userTimeSeconds) /
              curves[c].fadeOutTime,
              );
        }

        const paramWeight: number = this._weight * fin * fout;

        // パラメータごとのフェードを適用
        v = sourceValue + (value - sourceValue) * paramWeight;
      }

      model.setParameterValueByIndex(parameterIndex, v, 1.0);
    }

    {
      if (eyeBlinkValue != Number.MAX_VALUE) {
        for (
          let i = 0;
          i < this._eyeBlinkParameterIds.length && i < MaxTargetSize;
          ++i
        ) {
          const sourceValue: number = model.getParameterValueById(
            this._eyeBlinkParameterIds[i],
          );

          // モーションでの上書きがあった時にはまばたきは適用しない
          if ((eyeBlinkFlags >> i) & 0x01) {
            continue;
          }

          const v: number =
            sourceValue + (eyeBlinkValue - sourceValue) * fadeWeight;

          model.setParameterValueById(this._eyeBlinkParameterIds[i], v);
        }
      }

      if (lipSyncValue != Number.MAX_VALUE) {
        for (
          let i = 0;
          i < this._lipSyncParameterIds.length && i < MaxTargetSize;
          ++i
        ) {
          const sourceValue: number = model.getParameterValueById(
            this._lipSyncParameterIds[i],
          );

          // モーションでの上書きがあった時にはリップシンクは適用しない
          if ((lipSyncFlags >> i) & 0x01) {
            continue;
          }

          const v: number =
            sourceValue + (lipSyncValue - sourceValue) * fadeWeight;

          model.setParameterValueById(this._lipSyncParameterIds[i], v);
        }
      }
    }

    for (
      ;
      c < this._motionData.curveCount &&
      curves[c].type ==
      CubismMotionCurveTarget.CubismMotionCurveTarget_PartOpacity;
      ++c
    ) {
      // Find parameter index.
      parameterIndex = model.getParameterIndex(curves[c].id);

      // Skip curve evaluation if no value in sink.
      if (parameterIndex == -1) {
        continue;
      }

      // Evaluate curve and apply value.
      value = evaluateCurve(this._motionData, c, time);

      model.setParameterValueByIndex(parameterIndex, value);
    }

    if (timeOffsetSeconds >= this._motionData.duration) {
      if (this._isLoop) {
        motionQueueEntry.setStartTime(userTimeSeconds); // 最初の状態へ
        if (this._isLoopFadeIn) {
          // ループ内でループ用フェードインが有効の時は、フェードイン設定し直し
          motionQueueEntry.setFadeInStartTime(userTimeSeconds);
        }
      } else {
        if (this._onFinishedMotion) {
          this._onFinishedMotion(this);
        }

        motionQueueEntry.setIsFinished(true);
      }
    }
    this._lastWeight = fadeWeight;
  }

  /**
   * ループ情報の設定
   * @param loop ループ情報
   */
  public setIsLoop(loop: boolean): void {
    this._isLoop = loop;
  }

  /**
   * ループ情報の取得
   * @return true ループする
   * @return false ループしない
   */
  public isLoop(): boolean {
    return this._isLoop;
  }

  /**
   * ループ時のフェードイン情報の設定
   * @param loopFadeIn  ループ時のフェードイン情報
   */
  public setIsLoopFadeIn(loopFadeIn: boolean): void {
    this._isLoopFadeIn = loopFadeIn;
  }

  /**
   * ループ時のフェードイン情報の取得
   *
   * @return  true    する
   * @return  false   しない
   */
  public isLoopFadeIn(): boolean {
    return this._isLoopFadeIn;
  }

  /**
   * モーションの長さを取得する。
   *
   * @return  モーションの長さ[秒]
   */
  public getDuration(): number {
    return this._isLoop ? -1.0 : this._loopDurationSeconds;
  }

  /**
   * モーションのループ時の長さを取得する。
   *
   * @return  モーションのループ時の長さ[秒]
   */
  public getLoopDuration(): number {
    return this._loopDurationSeconds;
  }

  /**
   * パラメータに対するフェードインの時間を設定する。
   *
   * @param parameterId     パラメータID
   * @param value           フェードインにかかる時間[秒]
   */
  public setParameterFadeInTime(
    parameterId: string,
    value: number,
  ): void {
    const curves: CubismMotionCurve[] = this._motionData.curves;

    for (let i = 0; i < this._motionData.curveCount; ++i) {
      if (parameterId == curves[i].id) {
        curves[i].fadeInTime = value;
        return;
      }
    }
  }

  /**
   * パラメータに対するフェードアウトの時間の設定
   * @param parameterId     パラメータID
   * @param value           フェードアウトにかかる時間[秒]
   */
  public setParameterFadeOutTime(
    parameterId: string,
    value: number,
  ): void {
    const curves: CubismMotionCurve[] = this._motionData.curves;

    for (let i = 0; i < this._motionData.curveCount; ++i) {
      if (parameterId == curves[i].id) {
        curves[i].fadeOutTime = value;
        return;
      }
    }
  }

  /**
   * パラメータに対するフェードインの時間の取得
   * @param    parameterId     パラメータID
   * @return   フェードインにかかる時間[秒]
   */
  public getParameterFadeInTime(parameterId: string): number {
    const curves: CubismMotionCurve[] = this._motionData.curves;

    for (let i = 0; i < this._motionData.curveCount; ++i) {
      if (parameterId == curves[i].id) {
        return curves[i].fadeInTime;
      }
    }

    return -1;
  }

  /**
   * パラメータに対するフェードアウトの時間を取得
   *
   * @param   parameterId     パラメータID
   * @return   フェードアウトにかかる時間[秒]
   */
  public getParameterFadeOutTime(parameterId: string): number {
    const curves: CubismMotionCurve[] = this._motionData.curves;

    for (let i = 0; i < this._motionData.curveCount; ++i) {
      if (parameterId == curves[i].id) {
        return curves[i].fadeOutTime;
      }
    }

    return -1;
  }

  /**
   * 自動エフェクトがかかっているパラメータIDリストの設定
   * @param eyeBlinkParameterIds    自動まばたきがかかっているパラメータIDのリスト
   * @param lipSyncParameterIds     リップシンクがかかっているパラメータIDのリスト
   */
  public setEffectIds(
    eyeBlinkParameterIds: string[],
    lipSyncParameterIds: string[],
  ): void {
    this._eyeBlinkParameterIds = eyeBlinkParameterIds;
    this._lipSyncParameterIds = lipSyncParameterIds;
  }

  /**
   * コンストラクタ
   */
  public constructor() {
    super();
    this._sourceFrameRate = 30.0;
    this._loopDurationSeconds = -1.0;
    this._isLoop = false; // trueから false へデフォルトを変更
    this._isLoopFadeIn = true; // ループ時にフェードインが有効かどうかのフラグ
    this._lastWeight = 0.0;
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    (this as Partial<this>)._motionData = undefined;
  }

  /**
   * motion3.jsonをパースする。
   *
   * @param motionJson  motion3.jsonが読み込まれているバッファ
   */
  public parse(motionJson: CubismSpec.MotionJSON): void {
    this._motionData = new CubismMotionData();

    let json: CubismMotionJson = new CubismMotionJson(motionJson);

    this._motionData.duration = json.getMotionDuration();
    this._motionData.loop = json.isMotionLoop();
    this._motionData.curveCount = json.getMotionCurveCount();
    this._motionData.fps = json.getMotionFps();
    this._motionData.eventCount = json.getEventCount();

    const fadeInSeconds = json.getMotionFadeInTime();
    const fadeOutSeconds = json.getMotionFadeOutTime();

    if (fadeInSeconds !== undefined) {
      this._fadeInSeconds = fadeInSeconds < 0.0 ? 1.0 : fadeInSeconds;
    } else {
      this._fadeInSeconds = 1.0;
    }

    if (fadeOutSeconds !== undefined) {
      this._fadeOutSeconds = fadeOutSeconds < 0.0 ? 1.0 : fadeOutSeconds;
    } else {
      this._fadeOutSeconds = 1.0;
    }

    this._motionData.curves = Array.from({ length: this._motionData.curveCount }).map(() => new CubismMotionCurve());
    this._motionData.segments = Array.from({ length: json.getMotionTotalSegmentCount() }).map(() => new CubismMotionSegment());
    this._motionData.events = Array.from({ length: this._motionData.eventCount }).map(() => new CubismMotionEvent());
    this._motionData.points = [];

    let totalPointCount = 0;
    let totalSegmentCount = 0;

    // Curves
    for (let curveCount = 0; curveCount < this._motionData.curveCount; ++curveCount) {
      const curve = this._motionData.curves[curveCount];

      switch (json.getMotionCurveTarget(curveCount)) {
        case TargetNameModel:
          curve.type = CubismMotionCurveTarget.CubismMotionCurveTarget_Model;
          break;

        case TargetNameParameter:
          curve.type = CubismMotionCurveTarget.CubismMotionCurveTarget_Parameter;
          break;

        case TargetNamePartOpacity:
          curve.type = CubismMotionCurveTarget.CubismMotionCurveTarget_PartOpacity;
          break;
      }

      curve.id = json.getMotionCurveId(curveCount);

      curve.baseSegmentIndex = totalSegmentCount;

      const fadeInTime = json.getMotionCurveFadeInTime(curveCount);
      const fadeOutTime = json.getMotionCurveFadeOutTime(curveCount);

      curve.fadeInTime = fadeInTime !== undefined ? fadeInTime : -1.0;
      curve.fadeOutTime = fadeOutTime !== undefined ? fadeOutTime : -1.0;

      // Segments
      for (
        let segmentPosition = 0;
        segmentPosition < json.getMotionCurveSegmentCount(curveCount);
      ) {
        if (segmentPosition == 0) {
          this._motionData.segments[totalSegmentCount].basePointIndex = totalPointCount;

          this._motionData.points[totalPointCount] = new CubismMotionPoint(
            json.getMotionCurveSegment(curveCount, segmentPosition),
            json.getMotionCurveSegment(curveCount, segmentPosition + 1),
          );

          totalPointCount += 1;
          segmentPosition += 2;
        } else {
          this._motionData.segments[totalSegmentCount].basePointIndex =
            totalPointCount - 1;
        }

        const segment: number = json.getMotionCurveSegment(
          curveCount,
          segmentPosition,
        );
        switch (segment) {
          case CubismMotionSegmentType.CubismMotionSegmentType_Linear: {
            this._motionData.segments[totalSegmentCount].segmentType =
              CubismMotionSegmentType.CubismMotionSegmentType_Linear;
            this._motionData.segments[totalSegmentCount].evaluate = linearEvaluate;

            this._motionData.points[totalPointCount] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 1),
              json.getMotionCurveSegment(curveCount, segmentPosition + 2),
            );

            totalPointCount += 1;
            segmentPosition += 3;

            break;
          }
          case CubismMotionSegmentType.CubismMotionSegmentType_Bezier: {
            this._motionData.segments[totalSegmentCount].segmentType =
              CubismMotionSegmentType.CubismMotionSegmentType_Bezier;
            this._motionData.segments[totalSegmentCount].evaluate = bezierEvaluate;

            this._motionData.points[totalPointCount] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 1),
              json.getMotionCurveSegment(curveCount, segmentPosition + 2),
            );

            this._motionData.points[totalPointCount + 1] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 3),
              json.getMotionCurveSegment(curveCount, segmentPosition + 4),
            );

            this._motionData.points[totalPointCount + 2] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 5),
              json.getMotionCurveSegment(curveCount, segmentPosition + 6),
            );

            totalPointCount += 3;
            segmentPosition += 7;

            break;
          }

          case CubismMotionSegmentType.CubismMotionSegmentType_Stepped: {
            this._motionData.segments[totalSegmentCount].segmentType =
              CubismMotionSegmentType.CubismMotionSegmentType_Stepped;
            this._motionData.segments[totalSegmentCount].evaluate = steppedEvaluate;

            this._motionData.points[totalPointCount] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 1),
              json.getMotionCurveSegment(curveCount, segmentPosition + 2),
            );

            totalPointCount += 1;
            segmentPosition += 3;

            break;
          }

          case CubismMotionSegmentType.CubismMotionSegmentType_InverseStepped: {
            this._motionData.segments[totalSegmentCount].segmentType =
              CubismMotionSegmentType.CubismMotionSegmentType_InverseStepped;
            this._motionData.segments[totalSegmentCount].evaluate = inverseSteppedEvaluate;

            this._motionData.points[totalPointCount] = new CubismMotionPoint(
              json.getMotionCurveSegment(curveCount, segmentPosition + 1),
              json.getMotionCurveSegment(curveCount, segmentPosition + 2),
            );

            totalPointCount += 1;
            segmentPosition += 3;

            break;
          }
          default: {
            CSM_ASSERT(0);
            break;
          }
        }

        ++curve.segmentCount;
        ++totalSegmentCount;
      }

      this._motionData.curves.push(curve);
    }

    for (
      let userdatacount = 0;
      userdatacount < json.getEventCount();
      ++userdatacount
    ) {
      this._motionData.events[userdatacount].fireTime = json.getEventTime(
        userdatacount,
      );
      this._motionData.events[userdatacount].value = json.getEventValue(
        userdatacount,
      );
    }

    json.release();
  }

  /**
   * モデルのパラメータ更新
   *
   * イベント発火のチェック。
   * 入力する時間は呼ばれるモーションタイミングを０とした秒数で行う。
   *
   * @param beforeCheckTimeSeconds   前回のイベントチェック時間[秒]
   * @param motionTimeSeconds        今回の再生時間[秒]
   */
  public getFiredEvent(
    beforeCheckTimeSeconds: number,
    motionTimeSeconds: number,
  ): string[] {
    this._firedEventValues.length = 0;

    // イベントの発火チェック
    for (let u = 0; u < this._motionData.eventCount; ++u) {
      if (
        this._motionData.events[u].fireTime > beforeCheckTimeSeconds &&
        this._motionData.events[u].fireTime <= motionTimeSeconds
      ) {
        this._firedEventValues.push(this._motionData.events[u].value);
      }
    }

    return this._firedEventValues;
  }

  public _sourceFrameRate: number; // ロードしたファイルのFPS。記述が無ければデフォルト値15fpsとなる
  public _loopDurationSeconds: number; // mtnファイルで定義される一連のモーションの長さ
  public _isLoop: boolean; // ループするか?
  public _isLoopFadeIn: boolean; // ループ時にフェードインが有効かどうかのフラグ。初期値では有効。
  public _lastWeight: number; // 最後に設定された重み

  public _motionData!: CubismMotionData; // 実際のモーションデータ本体

  public _eyeBlinkParameterIds: string[] = []; // 自動まばたきを適用するパラメータIDハンドルのリスト。  モデル（モデルセッティング）とパラメータを対応付ける。
  public _lipSyncParameterIds: string[] = []; // リップシンクを適用するパラメータIDハンドルのリスト。  モデル（モデルセッティング）とパラメータを対応付ける。

  public _modelCurveIdEyeBlink?: string; // モデルが持つ自動まばたき用パラメータIDのハンドル。  モデルとモーションを対応付ける。
  public _modelCurveIdLipSync?: string; // モデルが持つリップシンク用パラメータIDのハンドル。  モデルとモーションを対応付ける。
}
