/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismModel } from '../model/cubismmodel';
import { ACubismMotion } from './acubismmotion';
import { CubismMotionQueueEntry } from './cubismmotionqueueentry';

// exp3.jsonのキーとデフォルト
const DefaultFadeTime = 1.0;

/**
 * 表情のモーション
 *
 * 表情のモーションクラス。
 */
export class CubismExpressionMotion extends ACubismMotion {
  /**
   * インスタンスを作成する。
   * @param json expファイルが読み込まれているバッファ
   * @param size バッファのサイズ
   * @return 作成されたインスタンス
   */
  public static create(json: CubismSpec.ExpressionJSON): CubismExpressionMotion {
    const expression: CubismExpressionMotion = new CubismExpressionMotion();

    const fadeInTime = json.FadeInTime;
    const fadeOutTime = json.FadeOutTime;

    expression.setFadeInTime(fadeInTime !== undefined ? fadeInTime : DefaultFadeTime); // フェードイン
    expression.setFadeOutTime(fadeOutTime !== undefined ? fadeOutTime : DefaultFadeTime); // フェードアウト

    // 各パラメータについて
    const parameters = json.Parameters || [];

    for (let i = 0; i < parameters.length; ++i) {
      const param = parameters[i];
      const parameterId: string = param.Id; // パラメータID

      const value: number = param.Value; // 値

      // 計算方法の設定
      let blendType: ExpressionBlendType;

      switch (param.Blend) {
        case 'Multiply':
          blendType = ExpressionBlendType.ExpressionBlendType_Multiply;
          break;

        case 'Overwrite':
          blendType = ExpressionBlendType.ExpressionBlendType_Overwrite;
          break;

        case 'Add':
        // その他 仕様にない値を設定した時は加算モードにすることで復旧
        default:
          blendType = ExpressionBlendType.ExpressionBlendType_Add;
          break;
      }

      // 設定オブジェクトを作成してリストに追加する
      const item: ExpressionParameter = {
        parameterId: parameterId,
        blendType: blendType,
        value: value,
      };

      expression._parameters.push(item);
    }

    return expression;
  }

  /**
   * モデルのパラメータの更新の実行
   * @param model 対象のモデル
   * @param userTimeSeconds デルタ時間の積算値[秒]
   * @param weight モーションの重み
   * @param motionQueueEntry CubismMotionQueueManagerで管理されているモーション
   */
  public doUpdateParameters(
    model: CubismModel,
    userTimeSeconds: number,
    weight: number,
    motionQueueEntry: CubismMotionQueueEntry,
  ): void {
    for (let i = 0; i < this._parameters.length; ++i) {
      const parameter: ExpressionParameter = this._parameters[i];

      switch (parameter.blendType) {
        case ExpressionBlendType.ExpressionBlendType_Add: {
          model.addParameterValueById(
            parameter.parameterId,
            parameter.value,
            weight,
          );
          break;
        }
        case ExpressionBlendType.ExpressionBlendType_Multiply: {
          model.multiplyParameterValueById(
            parameter.parameterId,
            parameter.value,
            weight,
          );
          break;
        }
        case ExpressionBlendType.ExpressionBlendType_Overwrite: {
          model.setParameterValueById(
            parameter.parameterId,
            parameter.value,
            weight,
          );
          break;
        }
        default:
          // 仕様にない値を設定した時はすでに加算モードになっている
          break;
      }
    }
  }

  /**
   * コンストラクタ
   */
  constructor() {
    super();

    this._parameters = [];
  }

  _parameters: ExpressionParameter[]; // 表情のパラメータ情報リスト
}

/**
 * 表情パラメータ値の計算方式
 */
export enum ExpressionBlendType {
  ExpressionBlendType_Add = 0, // 加算
  ExpressionBlendType_Multiply = 1, // 乗算
  ExpressionBlendType_Overwrite = 2 // 上書き
}

/**
 * 表情のパラメータ情報
 */
export interface ExpressionParameter {
  parameterId: string; // パラメータID
  blendType: ExpressionBlendType; // パラメータの演算種類
  value: number; // 値
}
