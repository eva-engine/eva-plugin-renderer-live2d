/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * motion3.jsonのコンテナ。
 */
export class CubismMotionJson {
  /**
   * コンストラクタ
   * @param json motion3.jsonが読み込まれているバッファ
   */
  public constructor(json: CubismSpec.MotionJSON) {
    this._json = json;
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    (this as any)._json = undefined;
  }

  /**
   * モーションの長さを取得する
   * @return モーションの長さ[秒]
   */
  public getMotionDuration(): number {
    return this._json.Meta.Duration;
  }

  /**
   * モーションのループ情報の取得
   * @return true ループする
   * @return false ループしない
   */
  public isMotionLoop(): boolean {
    return this._json.Meta.Loop || false;
  }

  /**
   * モーションカーブの個数の取得
   * @return モーションカーブの個数
   */
  public getMotionCurveCount(): number {
    return this._json.Meta.CurveCount;
  }

  /**
   * モーションのフレームレートの取得
   * @return フレームレート[FPS]
   */
  public getMotionFps(): number {
    return this._json.Meta.Fps;
  }

  /**
   * モーションのセグメントの総合計の取得
   * @return モーションのセグメントの取得
   */
  public getMotionTotalSegmentCount(): number {
    return this._json.Meta.TotalSegmentCount;
  }

  /**
   * モーションのカーブの制御店の総合計の取得
   * @return モーションのカーブの制御点の総合計
   */
  public getMotionTotalPointCount(): number {
    return this._json.Meta.TotalPointCount;
  }

  /**
   * モーションのフェードイン時間の取得
   * @return フェードイン時間[秒]
   */
  public getMotionFadeInTime(): number | undefined {
    return this._json.Meta.FadeInTime;
  }

  /**
   * モーションのフェードアウト時間の取得
   * @return フェードアウト時間[秒]
   */
  public getMotionFadeOutTime(): number | undefined {
    return this._json.Meta.FadeOutTime;
  }

  /**
   * モーションのカーブの種類の取得
   * @param curveIndex カーブのインデックス
   * @return カーブの種類
   */
  public getMotionCurveTarget(curveIndex: number): string {
    return this._json.Curves[curveIndex].Target;
  }

  /**
   * モーションのカーブのIDの取得
   * @param curveIndex カーブのインデックス
   * @return カーブのID
   */
  public getMotionCurveId(curveIndex: number): string {
    return this._json.Curves[curveIndex].Id;
  }

  /**
   * モーションのカーブのフェードイン時間の取得
   * @param curveIndex カーブのインデックス
   * @return フェードイン時間[秒]
   */
  public getMotionCurveFadeInTime(curveIndex: number): number | undefined {
    return this._json.Curves[curveIndex].FadeInTime;
  }

  /**
   * モーションのカーブのフェードアウト時間の取得
   * @param curveIndex カーブのインデックス
   * @return フェードアウト時間[秒]
   */
  public getMotionCurveFadeOutTime(curveIndex: number): number | undefined {
    return this._json.Curves[curveIndex].FadeOutTime;
  }

  /**
   * モーションのカーブのセグメントの個数を取得する
   * @param curveIndex カーブのインデックス
   * @return モーションのカーブのセグメントの個数
   */
  public getMotionCurveSegmentCount(curveIndex: number): number {
    return this._json.Curves[curveIndex].Segments.length;
  }

  /**
   * モーションのカーブのセグメントの値の取得
   * @param curveIndex カーブのインデックス
   * @param segmentIndex セグメントのインデックス
   * @return セグメントの値
   */
  public getMotionCurveSegment(
    curveIndex: number,
    segmentIndex: number,
  ): number {
    return this._json.Curves[curveIndex].Segments[segmentIndex];
  }

  /**
   * イベントの個数の取得
   * @return イベントの個数
   */
  public getEventCount(): number {
    return this._json.Meta.UserDataCount || 0;
  }

  /**
   *  イベントの総文字数の取得
   * @return イベントの総文字数
   */
  public getTotalEventValueSize(): number {
    return this._json.Meta.TotalUserDataSize!;
  }

  /**
   * イベントの時間の取得
   * @param userDataIndex イベントのインデックス
   * @return イベントの時間[秒]
   */
  public getEventTime(userDataIndex: number): number {
    return this._json.UserData![userDataIndex].Time!;
  }

  /**
   * イベントの取得
   * @param userDataIndex イベントのインデックス
   * @return イベントの文字列
   */
  public getEventValue(userDataIndex: number): string {
    return this._json.UserData![userDataIndex].Value!;
  }

  _json: CubismSpec.MotionJSON; // motion3.jsonのデータ
}
