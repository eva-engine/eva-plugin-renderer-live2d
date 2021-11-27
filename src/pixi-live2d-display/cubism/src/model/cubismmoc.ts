/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismModel } from './cubismmodel';

/**
 * Mocデータの管理
 *
 * Mocデータの管理を行うクラス。
 */
export class CubismMoc {
  /**
   * Mocデータの作成
   */
  public static create(mocBytes: ArrayBuffer): CubismMoc {
    const moc: Live2DCubismCore.Moc = Live2DCubismCore.Moc.fromArrayBuffer(mocBytes);

    if (moc) {
      return new CubismMoc(moc);
    }

    throw new Error('Unknown error');
  }

  /**
   * モデルを作成する
   *
   * @return Mocデータから作成されたモデル
   */
  createModel(): CubismModel {
    let cubismModel: CubismModel;

    const model: Live2DCubismCore.Model = Live2DCubismCore.Model.fromMoc(this._moc);

    if (model) {
      cubismModel = new CubismModel(model);

      ++this._modelCount;

      return cubismModel;
    }

    throw new Error('Unknown error');
  }

  /**
   * モデルを削除する
   */
  deleteModel(model: CubismModel): void {
    if (model != null) {
      --this._modelCount;
    }
  }

  /**
   * コンストラクタ
   */
  private constructor(moc: Live2DCubismCore.Moc) {
    this._moc = moc;
    this._modelCount = 0;
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    this._moc._release();
    (this as Partial<this>)._moc = undefined;
  }

  _moc: Live2DCubismCore.Moc; // Mocデータ
  _modelCount: number; // Mocデータから作られたモデルの個数
}
