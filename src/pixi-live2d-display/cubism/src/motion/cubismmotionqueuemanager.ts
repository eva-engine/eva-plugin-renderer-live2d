/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismModel } from '../model/cubismmodel';
import { ACubismMotion } from './acubismmotion';
import { CubismMotionQueueEntry } from './cubismmotionqueueentry';

/**
 * モーション再生の管理
 *
 * モーション再生の管理用クラス。CubismMotionモーションなどACubismMotionのサブクラスを再生するために使用する。
 *
 * @note 再生中に別のモーションが StartMotion()された場合は、新しいモーションに滑らかに変化し旧モーションは中断する。
 *       表情用モーション、体用モーションなどを分けてモーション化した場合など、
 *       複数のモーションを同時に再生させる場合は、複数のCubismMotionQueueManagerインスタンスを使用する。
 */
export class CubismMotionQueueManager {
  /**
   * コンストラクタ
   */
  public constructor() {
    this._userTimeSeconds = 0.0;
    this._eventCustomData = null;
    this._motions = [];
  }

  /**
   * デストラクタ
   */
  public release(): void {
    for (let i = 0; i < this._motions.length; ++i) {
      if (this._motions[i]) {
        this._motions[i].release();
      }
    }

    (this as Partial<this>)._motions = undefined;
  }

  /**
   * 指定したモーションの開始
   *
   * 指定したモーションを開始する。同じタイプのモーションが既にある場合は、既存のモーションに終了フラグを立て、フェードアウトを開始させる。
   *
   * @param   motion          開始するモーション
   * @param   autoDelete      再生が終了したモーションのインスタンスを削除するなら true
   * @param   userTimeSeconds デルタ時間の積算値[秒]
   * @return                      開始したモーションの識別番号を返す。個別のモーションが終了したか否かを判定するIsFinished()の引数で使用する。開始できない時は「-1」
   */
  public startMotion(
    motion: ACubismMotion,
    autoDelete: boolean,
    userTimeSeconds: number,
  ): CubismMotionQueueEntryHandle {
    if (motion == null) {
      return InvalidMotionQueueEntryHandleValue;
    }

    let motionQueueEntry: CubismMotionQueueEntry;

    // 既にモーションがあれば終了フラグを立てる
    for (let i = 0; i < this._motions.length; ++i) {
      motionQueueEntry = this._motions[i];
      if (motionQueueEntry == null) {
        continue;
      }

      motionQueueEntry.setFadeOut(motionQueueEntry._motion.getFadeOutTime()); // フェードアウト設定
    }

    motionQueueEntry = new CubismMotionQueueEntry(); // 終了時に破棄する
    motionQueueEntry._autoDelete = autoDelete;
    motionQueueEntry._motion = motion;

    this._motions.push(motionQueueEntry);

    return motionQueueEntry._motionQueueEntryHandle;
  }

  /**
   * 全てのモーションの終了の確認
   * @return true 全て終了している
   * @return false 終了していない
   */
  public isFinished(): boolean {
    // ------- 処理を行う -------
    // 既にモーションがあれば終了フラグを立てる

    let i = 0;

    while (i < this._motions.length) {
      const motionQueueEntry: CubismMotionQueueEntry = this._motions[i];

      if (motionQueueEntry == null) {
        this._motions.splice(i, 1); // 削除
        continue;
      }

      const motion: ACubismMotion = motionQueueEntry._motion;

      if (motion == null) {
        motionQueueEntry.release();
        this._motions.splice(i, 1); // 削除
        continue;
      }

      // ----- 終了済みの処理があれば削除する ------
      if (!motionQueueEntry.isFinished()) {
        return false;
      }

      i++;
    }

    return true;
  }

  /**
   * 指定したモーションの終了の確認
   * @param motionQueueEntryNumber モーションの識別番号
   * @return true 全て終了している
   * @return false 終了していない
   */
  public isFinishedByHandle(
    motionQueueEntryNumber: CubismMotionQueueEntryHandle,
  ): boolean {
    // 既にモーションがあれば終了フラグを立てる
    for (let i = 0; i < this._motions.length; i++) {
      const motionQueueEntry: CubismMotionQueueEntry = this._motions[i];

      if (motionQueueEntry == null) {
        continue;
      }

      if (
        motionQueueEntry._motionQueueEntryHandle == motionQueueEntryNumber &&
        !motionQueueEntry.isFinished()
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * 全てのモーションを停止する
   */
  public stopAllMotions(): void {
    // ------- 処理を行う -------
    // 既にモーションがあれば終了フラグを立てる

    for (let i = 0; i < this._motions.length; i++) {
      const motionQueueEntry: CubismMotionQueueEntry = this._motions[i];

      if (motionQueueEntry != null) {
        // ----- 終了済みの処理があれば削除する ------
        motionQueueEntry.release();
      }
    }

    this._motions = [];
  }

  /**
   * 指定したCubismMotionQueueEntryの取得

   * @param   motionQueueEntryNumber  モーションの識別番号
   * @return  指定したCubismMotionQueueEntry
   * @return  null   見つからなかった
   */
  public getCubismMotionQueueEntry(
    motionQueueEntryNumber: any,
  ): CubismMotionQueueEntry | undefined {
    //------- 処理を行う -------
    // 既にモーションがあれば終了フラグを立てる
    return this._motions.find(entry => entry != null && entry._motionQueueEntryHandle == motionQueueEntryNumber);
  }

  /**
   * イベントを受け取るCallbackの登録
   *
   * @param callback コールバック関数
   * @param customData コールバックに返されるデータ
   */
  public setEventCallback(
    callback: CubismMotionEventFunction,
    customData: any = null,
  ): void {
    this._eventCallBack = callback;
    this._eventCustomData = customData;
  }

  /**
   * モーションを更新して、モデルにパラメータ値を反映する。
   *
   * @param   model   対象のモデル
   * @param   userTimeSeconds   デルタ時間の積算値[秒]
   * @return  true    モデルへパラメータ値の反映あり
   * @return  false   モデルへパラメータ値の反映なし(モーションの変化なし)
   */
  public doUpdateMotion(
    model: CubismModel,
    userTimeSeconds: number,
  ): boolean {
    let updated = false;

    // ------- 処理を行う --------
    // 既にモーションがあれば終了フラグを立てる

    let i = 0;

    while (i < this._motions.length) {
      const motionQueueEntry: CubismMotionQueueEntry = this._motions[i];

      if (motionQueueEntry == null) {
        this._motions.splice(i, 1); // 削除
        continue;
      }

      const motion: ACubismMotion = motionQueueEntry._motion;

      if (motion == null) {
        motionQueueEntry.release();
        this._motions.splice(i, 1); // 削除
        continue;
      }

      // ------ 値を反映する ------
      motion.updateParameters(model, motionQueueEntry, userTimeSeconds);
      updated = true;

      // ------ ユーザトリガーイベントを検査する ----
      const firedList: string[] = motion.getFiredEvent(
        motionQueueEntry.getLastCheckEventSeconds() -
        motionQueueEntry.getStartTime(),
        userTimeSeconds - motionQueueEntry.getStartTime(),
      );

      for (let i = 0; i < firedList.length; ++i) {
        this._eventCallBack(this, firedList[i], this._eventCustomData);
      }

      motionQueueEntry.setLastCheckEventSeconds(userTimeSeconds);

      // ------ 終了済みの処理があれば削除する ------
      if (motionQueueEntry.isFinished()) {
        motionQueueEntry.release();
        this._motions.splice(i, 1); // 削除
      } else {
        if (motionQueueEntry.isTriggeredFadeOut()) {
          motionQueueEntry.startFadeOut(
            motionQueueEntry.getFadeOutSeconds(),
            userTimeSeconds
          );
        }
        i++;
      }
    }

    return updated;
  }

  _userTimeSeconds: number; // デルタ時間の積算値[秒]

  _motions: CubismMotionQueueEntry[]; // モーション
  _eventCallBack!: CubismMotionEventFunction; // コールバック関数
  _eventCustomData: any; // コールバックに戻されるデータ
}

/**
 * イベントのコールバック関数を定義
 *
 * イベントのコールバックに登録できる関数の型情報
 * @param caller        発火したイベントを再生させたCubismMotionQueueManager
 * @param eventValue    発火したイベントの文字列データ
 * @param customData   コールバックに返される登録時に指定されたデータ
 */
export interface CubismMotionEventFunction {
  (
    caller: CubismMotionQueueManager,
    eventValue: string,
    customData: any,
  ): void;
}

/**
 * モーションの識別番号
 *
 * モーションの識別番号の定義
 */
export declare type CubismMotionQueueEntryHandle = any;
export const InvalidMotionQueueEntryHandleValue: CubismMotionQueueEntryHandle = -1;
