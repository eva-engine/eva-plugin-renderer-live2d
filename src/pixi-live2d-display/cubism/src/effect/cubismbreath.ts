/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismModel } from '../model/cubismmodel';

/**
 * 呼吸機能
 *
 * 呼吸機能を提供する。
 */
export class CubismBreath {
  /**
   * インスタンスの作成
   */
  public static create(): CubismBreath {
    return new CubismBreath();
  }

  /**
   * 呼吸のパラメータの紐づけ
   * @param breathParameters 呼吸を紐づけたいパラメータのリスト
   */
  public setParameters(
    breathParameters: BreathParameterData[],
  ): void {
    this._breathParameters = breathParameters;
  }

  /**
   * 呼吸に紐づいているパラメータの取得
   * @return 呼吸に紐づいているパラメータのリスト
   */
  public getParameters(): BreathParameterData[] {
    return this._breathParameters;
  }

  /**
   * モデルのパラメータの更新
   * @param model 対象のモデル
   * @param deltaTimeSeconds デルタ時間[秒]
   */
  public updateParameters(
    model: CubismModel,
    deltaTimeSeconds: number,
  ): void {
    this._currentTime += deltaTimeSeconds;

    const t: number = this._currentTime * 2.0 * 3.14159;

    for (let i = 0; i < this._breathParameters.length; ++i) {
      const data: BreathParameterData = this._breathParameters[i];

      model.addParameterValueById(
        data.parameterId,
        data.offset + data.peak * Math.sin(t / data.cycle),
        data.weight,
      );
    }
  }

  /**
   * コンストラクタ
   */
  public constructor() {
    this._currentTime = 0.0;
  }

  _breathParameters: BreathParameterData[] = []; // 呼吸にひもづいているパラメータのリスト
  _currentTime: number; // 積算時間[秒]
}

/**
 * 呼吸のパラメータ情報
 */
export class BreathParameterData {
  /**
   * コンストラクタ
   * @param parameterId   呼吸をひもづけるパラメータID
   * @param offset        呼吸を正弦波としたときの、波のオフセット
   * @param peak          呼吸を正弦波としたときの、波の高さ
   * @param cycle         呼吸を正弦波としたときの、波の周期
   * @param weight        パラメータへの重み
   */
  constructor(
    parameterId?: string,
    offset?: number,
    peak?: number,
    cycle?: number,
    weight?: number,
  ) {
    this.parameterId = parameterId == undefined ? undefined : parameterId;
    this.offset = offset == undefined ? 0.0 : offset;
    this.peak = peak == undefined ? 0.0 : peak;
    this.cycle = cycle == undefined ? 0.0 : cycle;
    this.weight = weight == undefined ? 0.0 : weight;
  }

  parameterId?: string; // 呼吸をひもづけるパラメータID\
  offset: number; // 呼吸を正弦波としたときの、波のオフセット
  peak: number; // 呼吸を正弦波としたときの、波の高さ
  cycle: number; // 呼吸を正弦波としたときの、波の周期
  weight: number; // パラメータへの重み
}
