/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismModel } from '../model/cubismmodel';

const Epsilon = 0.001;
const DefaultFadeInSeconds = 0.5;

/**
 * パーツの不透明度の設定
 *
 * パーツの不透明度の管理と設定を行う。
 */
export class CubismPose {
  /**
   * インスタンスの作成
   * @param pose3json pose3.jsonのデータ
   * @return 作成されたインスタンス
   */
  public static create(pose3json: CubismSpec.PoseJSON): CubismPose {
    const ret: CubismPose = new CubismPose();

    // フェード時間の指定
    if (typeof pose3json.FadeInTime === 'number') {
      ret._fadeTimeSeconds = pose3json.FadeInTime;

      if (ret._fadeTimeSeconds <= 0.0) {
        ret._fadeTimeSeconds = DefaultFadeInSeconds;
      }
    }

    // パーツグループ
    const poseListInfo = pose3json.Groups;
    const poseCount: number = poseListInfo.length;

    for (let poseIndex = 0; poseIndex < poseCount; ++poseIndex) {
      const idListInfo = poseListInfo[poseIndex];
      const idCount: number = idListInfo.length;
      let groupCount = 0;

      for (let groupIndex = 0; groupIndex < idCount; ++groupIndex) {
        const partInfo = idListInfo[groupIndex];
        const partData: PartData = new PartData();

        partData.partId = partInfo.Id;

        const linkListInfo = partInfo.Link;

        // リンクするパーツの設定
        if (linkListInfo) {
          const linkCount: number = linkListInfo.length;

          for (let linkIndex = 0; linkIndex < linkCount; ++linkIndex) {
            const linkPart: PartData = new PartData();

            linkPart.partId = linkListInfo[linkIndex];

            partData.link.push(linkPart);
          }
        }

        ret._partGroups.push(partData);

        ++groupCount;
      }

      ret._partGroupCounts.push(groupCount);
    }

    return ret;
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
    // 前回のモデルと同じでない場合は初期化が必要
    if (model != this._lastModel) {
      // パラメータインデックスの初期化
      this.reset(model);
    }

    this._lastModel = model;

    // 設定から時間を変更すると、経過時間がマイナスになる事があるので、経過時間0として対応
    if (deltaTimeSeconds < 0.0) {
      deltaTimeSeconds = 0.0;
    }

    let beginIndex = 0;

    for (let i = 0; i < this._partGroupCounts.length; i++) {
      const partGroupCount: number = this._partGroupCounts[i];

      this.doFade(model, deltaTimeSeconds, beginIndex, partGroupCount);

      beginIndex += partGroupCount;
    }

    this.copyPartOpacities(model);
  }

  /**
   * 表示を初期化
   * @param model 対象のモデル
   * @note 不透明度の初期値が0でないパラメータは、不透明度を１に設定する
   */
  public reset(model: CubismModel): void {
    let beginIndex = 0;

    for (let i = 0; i < this._partGroupCounts.length; ++i) {
      const groupCount: number = this._partGroupCounts[i];

      for (let j: number = beginIndex; j < beginIndex + groupCount; ++j) {
        this._partGroups[j].initialize(model);

        const partsIndex: number = this._partGroups[j].partIndex;
        const paramIndex: number = this._partGroups[j].parameterIndex;

        if (partsIndex < 0) {
          continue;
        }

        model.setPartOpacityByIndex(partsIndex, j == beginIndex ? 1.0 : 0.0);
        model.setParameterValueByIndex(
          paramIndex,
          j == beginIndex ? 1.0 : 0.0,
        );

        for (let k = 0; k < this._partGroups[j].link.length; ++k) {
          this._partGroups
            [j]
            .link[k]
            .initialize(model);
        }
      }

      beginIndex += groupCount;
    }
  }

  /**
   * パーツの不透明度をコピー
   *
   * @param model 対象のモデル
   */
  public copyPartOpacities(model: CubismModel): void {
    for (
      let groupIndex = 0;
      groupIndex < this._partGroups.length;
      ++groupIndex
    ) {
      const partData: PartData = this._partGroups[groupIndex];

      if (partData.link.length == 0) {
        continue; // 連動するパラメータはない
      }

      const partIndex: number = this._partGroups[groupIndex].partIndex;
      const opacity: number = model.getPartOpacityByIndex(partIndex);

      for (
        let linkIndex = 0;
        linkIndex < partData.link.length;
        ++linkIndex
      ) {
        const linkPart: PartData = partData.link[linkIndex];
        const linkPartIndex: number = linkPart.partIndex;

        if (linkPartIndex < 0) {
          continue;
        }

        model.setPartOpacityByIndex(linkPartIndex, opacity);
      }
    }
  }

  /**
   * パーツのフェード操作を行う。
   * @param model 対象のモデル
   * @param deltaTimeSeconds デルタ時間[秒]
   * @param beginIndex フェード操作を行うパーツグループの先頭インデックス
   * @param partGroupCount フェード操作を行うパーツグループの個数
   */
  public doFade(
    model: CubismModel,
    deltaTimeSeconds: number,
    beginIndex: number,
    partGroupCount: number,
  ): void {
    let visiblePartIndex = -1;
    let newOpacity = 1.0;

    const phi = 0.5;
    const backOpacityThreshold = 0.15;

    // 現在、表示状態になっているパーツを取得
    for (let i: number = beginIndex; i < beginIndex + partGroupCount; ++i) {
      const partIndex: number = this._partGroups[i].partIndex;
      const paramIndex: number = this._partGroups[i].parameterIndex;

      if (model.getParameterValueByIndex(paramIndex) > Epsilon) {
        if (visiblePartIndex >= 0) {
          break;
        }

        visiblePartIndex = i;
        newOpacity = model.getPartOpacityByIndex(partIndex);

        // 新しい不透明度を計算
        newOpacity += deltaTimeSeconds / this._fadeTimeSeconds;

        if (newOpacity > 1.0) {
          newOpacity = 1.0;
        }
      }
    }

    if (visiblePartIndex < 0) {
      visiblePartIndex = 0;
      newOpacity = 1.0;
    }

    // 表示パーツ、非表示パーツの不透明度を設定する
    for (let i: number = beginIndex; i < beginIndex + partGroupCount; ++i) {
      const partsIndex: number = this._partGroups[i].partIndex;

      // 表示パーツの設定
      if (visiblePartIndex == i) {
        model.setPartOpacityByIndex(partsIndex, newOpacity); // 先に設定
      }
      // 非表示パーツの設定
      else {
        let opacity: number = model.getPartOpacityByIndex(partsIndex);
        let a1: number; // 計算によって求められる不透明度

        if (newOpacity < phi) {
          a1 = (newOpacity * (phi - 1)) / phi + 1.0; // (0,1),(phi,phi)を通る直線式
        } else {
          a1 = ((1 - newOpacity) * phi) / (1.0 - phi); // (1,0),(phi,phi)を通る直線式
        }

        // 背景の見える割合を制限する場合
        const backOpacity: number = (1.0 - a1) * (1.0 - newOpacity);

        if (backOpacity > backOpacityThreshold) {
          a1 = 1.0 - backOpacityThreshold / (1.0 - newOpacity);
        }

        if (opacity > a1) {
          opacity = a1; // 計算の不透明度よりも大きければ（濃ければ）不透明度を上げる
        }

        model.setPartOpacityByIndex(partsIndex, opacity);
      }
    }
  }

  /**
   * コンストラクタ
   */
  public constructor() {
    this._fadeTimeSeconds = DefaultFadeInSeconds;
    this._lastModel = undefined;
    this._partGroups = [];
    this._partGroupCounts = [];
  }

  _partGroups: PartData[]; // パーツグループ
  _partGroupCounts: number[]; // それぞれのパーツグループの個数
  _fadeTimeSeconds: number; // フェード時間[秒]
  _lastModel?: CubismModel; // 前回操作したモデル
}

/**
 * パーツにまつわるデータを管理
 */
export class PartData {
  /**
   * コンストラクタ
   */
  constructor(v?: PartData) {
    this.parameterIndex = 0;
    this.partIndex = 0;
    this.partId = '';
    this.link = [];

    if (v != undefined) {
      this.assignment(v);
    }
  }

  /**
   * =演算子のオーバーロード
   */
  public assignment(v: PartData): PartData {
    this.partId = v.partId;
    this.link = v.link.map(link => link.clone());

    return this;
  }

  /**
   * 初期化
   * @param model 初期化に使用するモデル
   */
  public initialize(model: CubismModel): void {
    this.parameterIndex = model.getParameterIndex(this.partId);
    this.partIndex = model.getPartIndex(this.partId);

    model.setParameterValueByIndex(this.parameterIndex, 1);
  }

  /**
   * オブジェクトのコピーを生成する
   */
  public clone(): PartData {
    const clonePartData: PartData = new PartData();

    clonePartData.partId = this.partId;
    clonePartData.parameterIndex = this.parameterIndex;
    clonePartData.partIndex = this.partIndex;
    clonePartData.link = this.link.map(link => link.clone());

    return clonePartData;
  }

  partId: string; // パーツID
  parameterIndex: number; // パラメータのインデックス
  partIndex: number; // パーツのインデックス
  link: PartData[]; // 連動するパラメータ
}
