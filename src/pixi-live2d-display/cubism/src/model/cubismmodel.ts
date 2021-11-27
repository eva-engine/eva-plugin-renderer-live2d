/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismBlendMode } from '../rendering/cubismrenderer';
import { CSM_ASSERT } from '../utils/cubismdebug';

/**
 * モデル
 *
 * Mocデータから生成されるモデルのクラス。
 */
export class CubismModel {
  /**
   * モデルのパラメータの更新
   */
  public update(): void {
    // Update model
    this._model.update();

    this._model.drawables.resetDynamicFlags();
  }

  /**
   * キャンバスの幅を取得する
   */
  public getCanvasWidth(): number {
    if (this._model == null) {
      return 0.0;
    }

    return (
      this._model.canvasinfo.CanvasWidth /
      this._model.canvasinfo.PixelsPerUnit
    );
  }

  /**
   * キャンバスの高さを取得する
   */
  public getCanvasHeight(): number {
    if (this._model == null) {
      return 0.0;
    }

    return (
      this._model.canvasinfo.CanvasHeight /
      this._model.canvasinfo.PixelsPerUnit
    );
  }

  /**
   * パラメータを保存する
   */
  public saveParameters(): void {
    const parameterCount: number = this._model.parameters.count;
    const savedParameterCount: number = this._savedParameters.length;

    for (let i = 0; i < parameterCount; ++i) {
      if (i < savedParameterCount) {
        this._savedParameters[i] = this._parameterValues[i];
      } else {
        this._savedParameters.push(this._parameterValues[i]);
      }
    }
  }

  /**
   * モデルを取得
   */
  public getModel(): Live2DCubismCore.Model {
    return this._model;
  }

  /**
   * パーツのインデックスを取得
   * @param partId パーツのID
   * @return パーツのインデックス
   */
  public getPartIndex(partId: string): number {
    let partIndex: number;
    const partCount: number = this._model.parts.count;

    for (partIndex = 0; partIndex < partCount; ++partIndex) {
      if (partId == this._partIds[partIndex]) {
        return partIndex;
      }
    }

    // モデルに存在していない場合、非存在パーツIDリスト内にあるかを検索し、そのインデックスを返す
    if (partId in this._notExistPartId) {
      return this._notExistPartId[partId];
    }

    // 非存在パーツIDリストにない場合、新しく要素を追加する
    partIndex = partCount + this._notExistPartId.length;
    this._notExistPartId[partId] = partIndex;
    this._notExistPartOpacities[partIndex] = 0;

    return partIndex;
  }

  /**
   * パーツの個数の取得
   * @return パーツの個数
   */
  public getPartCount(): number {
    return this._model.parts.count;
  }

  /**
   * パーツの不透明度の設定(Index)
   * @param partIndex パーツのインデックス
   * @param opacity 不透明度
   */
  public setPartOpacityByIndex(partIndex: number, opacity: number): void {
    if (partIndex in this._notExistPartOpacities) {
      this._notExistPartOpacities[partIndex] = opacity;
      return;
    }

    // インデックスの範囲内検知
    CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());

    this._partOpacities[partIndex] = opacity;
  }

  /**
   * パーツの不透明度の設定(Id)
   * @param partId パーツのID
   * @param opacity パーツの不透明度
   */
  public setPartOpacityById(partId: string, opacity: number): void {
    // 高速化のためにPartIndexを取得できる機構になっているが、外部からの設定の時は呼び出し頻度が低いため不要
    const index: number = this.getPartIndex(partId);

    if (index < 0) {
      return; // パーツがないのでスキップ
    }

    this.setPartOpacityByIndex(index, opacity);
  }

  /**
   * パーツの不透明度の取得(index)
   * @param partIndex パーツのインデックス
   * @return パーツの不透明度
   */
  public getPartOpacityByIndex(partIndex: number): number {
    if (partIndex in this._notExistPartOpacities) {
      // モデルに存在しないパーツIDの場合、非存在パーツリストから不透明度を返す。
      return this._notExistPartOpacities[partIndex];
    }

    // インデックスの範囲内検知
    CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());

    return this._partOpacities[partIndex];
  }

  /**
   * パーツの不透明度の取得(id)
   * @param partId パーツのＩｄ
   * @return パーツの不透明度
   */
  public getPartOpacityById(partId: string): number {
    // 高速化のためにPartIndexを取得できる機構になっているが、外部からの設定の時は呼び出し頻度が低いため不要
    const index: number = this.getPartIndex(partId);

    if (index < 0) {
      return 0; // パーツが無いのでスキップ
    }

    return this.getPartOpacityByIndex(index);
  }

  /**
   * パラメータのインデックスの取得
   * @param パラメータID
   * @return パラメータのインデックス
   */
  public getParameterIndex(parameterId: string): number {
    let parameterIndex: number;
    const idCount: number = this._model.parameters.count;

    for (parameterIndex = 0; parameterIndex < idCount; ++parameterIndex) {
      if (parameterId != this._parameterIds[parameterIndex]) {
        continue;
      }

      return parameterIndex;
    }

    // モデルに存在していない場合、非存在パラメータIDリスト内を検索し、そのインデックスを返す
    if (parameterId in this._notExistParameterId) {
      return this._notExistParameterId[parameterId];
    }

    // 非存在パラメータIDリストにない場合新しく要素を追加する
    parameterIndex = this._model.parameters.count + Object.keys(this._notExistParameterId).length;

    this._notExistParameterId[parameterId] = parameterIndex;
    this._notExistParameterValues[parameterIndex] = 0;

    return parameterIndex;
  }

  /**
   * パラメータの個数の取得
   * @return パラメータの個数
   */
  public getParameterCount(): number {
    return this._model.parameters.count;
  }

  /**
   * パラメータの最大値の取得
   * @param parameterIndex パラメータのインデックス
   * @return パラメータの最大値
   */
  public getParameterMaximumValue(parameterIndex: number): number {
    return this._model.parameters.maximumValues[parameterIndex];
  }

  /**
   * パラメータの最小値の取得
   * @param parameterIndex パラメータのインデックス
   * @return パラメータの最小値
   */
  public getParameterMinimumValue(parameterIndex: number): number {
    return this._model.parameters.minimumValues[parameterIndex];
  }

  /**
   * パラメータのデフォルト値の取得
   * @param parameterIndex パラメータのインデックス
   * @return パラメータのデフォルト値
   */
  public getParameterDefaultValue(parameterIndex: number): number {
    return this._model.parameters.defaultValues[parameterIndex];
  }

  /**
   * パラメータの値の取得
   * @param parameterIndex    パラメータのインデックス
   * @return パラメータの値
   */
  public getParameterValueByIndex(parameterIndex: number): number {
    if (parameterIndex in this._notExistParameterValues) {
      return this._notExistParameterValues[parameterIndex];
    }

    // インデックスの範囲内検知
    CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());

    return this._parameterValues[parameterIndex];
  }

  /**
   * パラメータの値の取得
   * @param parameterId    パラメータのID
   * @return パラメータの値
   */
  public getParameterValueById(parameterId: string): number {
    // 高速化のためにparameterIndexを取得できる機構になっているが、外部からの設定の時は呼び出し頻度が低いため不要
    const parameterIndex: number = this.getParameterIndex(parameterId);
    return this.getParameterValueByIndex(parameterIndex);
  }

  /**
   * パラメータの値の設定
   * @param parameterIndex パラメータのインデックス
   * @param value パラメータの値
   * @param weight 重み
   */
  public setParameterValueByIndex(
    parameterIndex: number,
    value: number,
    weight = 1.0,
  ): void {
    if (parameterIndex in this._notExistParameterValues) {
      this._notExistParameterValues[parameterIndex] =
        weight == 1
          ? value
          : this._notExistParameterValues[parameterIndex] *
          (1 - weight) +
          value * weight;

      return;
    }

    // インデックスの範囲内検知
    CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());

    if (this._model.parameters.maximumValues[parameterIndex] < value) {
      value = this._model.parameters.maximumValues[parameterIndex];
    }
    if (this._model.parameters.minimumValues[parameterIndex] > value) {
      value = this._model.parameters.minimumValues[parameterIndex];
    }

    this._parameterValues[parameterIndex] =
      weight == 1
        ? value
        : (this._parameterValues[parameterIndex] =
        this._parameterValues[parameterIndex] * (1 - weight) +
        value * weight);
  }

  /**
   * パラメータの値の設定
   * @param parameterId パラメータのID
   * @param value パラメータの値
   * @param weight 重み
   */
  public setParameterValueById(
    parameterId: string,
    value: number,
    weight = 1.0,
  ): void {
    const index: number = this.getParameterIndex(parameterId);
    this.setParameterValueByIndex(index, value, weight);
  }

  /**
   * パラメータの値の加算(index)
   * @param parameterIndex パラメータインデックス
   * @param value 加算する値
   * @param weight 重み
   */
  public addParameterValueByIndex(
    parameterIndex: number,
    value: number,
    weight = 1.0,
  ): void {
    this.setParameterValueByIndex(
      parameterIndex,
      this.getParameterValueByIndex(parameterIndex) + value * weight,
    );
  }

  /**
   * パラメータの値の加算(id)
   * @param parameterId パラメータＩＤ
   * @param value 加算する値
   * @param weight 重み
   */
  public addParameterValueById(
    parameterId: any,
    value: number,
    weight = 1.0,
  ): void {
    const index: number = this.getParameterIndex(parameterId);
    this.addParameterValueByIndex(index, value, weight);
  }

  /**
   * パラメータの値の乗算
   * @param parameterId パラメータのID
   * @param value 乗算する値
   * @param weight 重み
   */
  public multiplyParameterValueById(
    parameterId: string,
    value: number,
    weight = 1.0,
  ): void {
    const index: number = this.getParameterIndex(parameterId);
    this.multiplyParameterValueByIndex(index, value, weight);
  }

  /**
   * パラメータの値の乗算
   * @param parameterIndex パラメータのインデックス
   * @param value 乗算する値
   * @param weight 重み
   */
  public multiplyParameterValueByIndex(
    parameterIndex: number,
    value: number,
    weight = 1.0,
  ): void {
    this.setParameterValueByIndex(
      parameterIndex,
      this.getParameterValueByIndex(parameterIndex) *
      (1.0 + (value - 1.0) * weight),
    );
  }

  public getDrawableIds() {
    return this._drawableIds.slice();
  }

  /**
   * Drawableのインデックスの取得
   * @param drawableId DrawableのID
   * @return Drawableのインデックス
   */
  public getDrawableIndex(drawableId: string): number {
    const drawableCount = this._model.drawables.count;

    for (
      let drawableIndex = 0;
      drawableIndex < drawableCount;
      ++drawableIndex
    ) {
      if (this._drawableIds[drawableIndex] == drawableId) {
        return drawableIndex;
      }
    }

    return -1;
  }

  /**
   * Drawableの個数の取得
   * @return drawableの個数
   */
  public getDrawableCount(): number {
    return this._model.drawables.count;
  }

  /**
   * DrawableのIDを取得する
   * @param drawableIndex Drawableのインデックス
   * @return drawableのID
   */
  public getDrawableId(drawableIndex: number): string {
    return this._model.drawables.ids[drawableIndex];
  }

  /**
   * Drawableの描画順リストの取得
   * @return Drawableの描画順リスト
   */
  public getDrawableRenderOrders(): Int32Array {
    return this._model.drawables.renderOrders;
  }

  /**
   * Drawableのテクスチャインデックスリストの取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableのテクスチャインデックスリスト
   */
  public getDrawableTextureIndices(drawableIndex: number): number {
    return this._model.drawables.textureIndices[drawableIndex];
  }

  /**
   * DrawableのVertexPositionsの変化情報の取得
   *
   * 直近のCubismModel.update関数でDrawableの頂点情報が変化したかを取得する。
   *
   * @param   drawableIndex   Drawableのインデックス
   * @retval  true    Drawableの頂点情報が直近のCubismModel.update関数で変化した
   * @retval  false   Drawableの頂点情報が直近のCubismModel.update関数で変化していない
   */
  public getDrawableDynamicFlagVertexPositionsDidChange(
    drawableIndex: number,
  ): boolean {
    const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
    return Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(
      dynamicFlags[drawableIndex],
    );
  }

  /**
   * Drawableの頂点インデックスの個数の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点インデックスの個数
   */
  public getDrawableVertexIndexCount(drawableIndex: number): number {
    return this._model.drawables.indexCounts[drawableIndex];
  }

  /**
   * Drawableの頂点の個数の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点の個数
   */
  public getDrawableVertexCount(drawableIndex: number): number {
    return this._model.drawables.vertexCounts[drawableIndex];
  }

  /**
   * Drawableの頂点リストの取得
   * @param drawableIndex drawableのインデックス
   * @return drawableの頂点リスト
   */
  public getDrawableVertices(drawableIndex: number): Float32Array {
    return this.getDrawableVertexPositions(drawableIndex);
  }

  /**
   * Drawableの頂点インデックスリストの取得
   * @param drarableIndex Drawableのインデックス
   * @return drawableの頂点インデックスリスト
   */
  public getDrawableVertexIndices(drawableIndex: number): Uint16Array {
    return this._model.drawables.indices[drawableIndex];
  }

  /**
   * Drawableの頂点リストの取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点リスト
   */
  public getDrawableVertexPositions(drawableIndex: number): Float32Array {
    return this._model.drawables.vertexPositions[drawableIndex];
  }

  /**
   * Drawableの頂点のUVリストの取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点UVリスト
   */
  public getDrawableVertexUvs(drawableIndex: number): Float32Array {
    return this._model.drawables.vertexUvs[drawableIndex];
  }

  /**
   * Drawableの不透明度の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの不透明度
   */
  public getDrawableOpacity(drawableIndex: number): number {
    return this._model.drawables.opacities[drawableIndex];
  }

  /**
   * Drawableのカリング情報の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableのカリング情報
   */
  public getDrawableCulling(drawableIndex: number): boolean {
    const constantFlags = this._model.drawables.constantFlags;

    return !Live2DCubismCore.Utils.hasIsDoubleSidedBit(
      constantFlags[drawableIndex],
    );
  }

  /**
   * Drawableのブレンドモードを取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableのブレンドモード
   */
  public getDrawableBlendMode(drawableIndex: number): CubismBlendMode {
    const constantFlags = this._model.drawables.constantFlags;

    return Live2DCubismCore.Utils.hasBlendAdditiveBit(
      constantFlags[drawableIndex],
    )
      ? CubismBlendMode.CubismBlendMode_Additive
      : Live2DCubismCore.Utils.hasBlendMultiplicativeBit(
        constantFlags[drawableIndex],
      )
        ? CubismBlendMode.CubismBlendMode_Multiplicative
        : CubismBlendMode.CubismBlendMode_Normal;
  }

  /**
   * Drawableのマスクの反転使用の取得
   *
   * Drawableのマスク使用時の反転設定を取得する。
   * マスクを使用しない場合は無視される。
   *
   * @param drawableIndex Drawableのインデックス
   * @return Drawableの反転設定
   */
  public getDrawableInvertedMaskBit(drawableIndex: number): boolean {
    const constantFlags: Uint8Array = this._model.drawables.constantFlags;

    return Live2DCubismCore.Utils.hasIsInvertedMaskBit(
      constantFlags[drawableIndex],
    );
  }

  /**
   * Drawableのクリッピングマスクリストの取得
   * @return Drawableのクリッピングマスクリスト
   */
  public getDrawableMasks(): Int32Array[] {
    return this._model.drawables.masks;
  }

  /**
   * Drawableのクリッピングマスクの個数リストの取得
   * @return Drawableのクリッピングマスクの個数リスト
   */
  public getDrawableMaskCounts(): Int32Array {
    return this._model.drawables.maskCounts;
  }

  /**
   * クリッピングマスクの使用状態
   *
   * @return true クリッピングマスクを使用している
   * @return false クリッピングマスクを使用していない
   */
  public isUsingMasking(): boolean {
    for (let d = 0; d < this._model.drawables.count; ++d) {
      if (this._model.drawables.maskCounts[d] <= 0) {
        continue;
      }
      return true;
    }
    return false;
  }

  /**
   * Drawableの表示情報を取得する
   *
   * @param drawableIndex Drawableのインデックス
   * @return true Drawableが表示
   * @return false Drawableが非表示
   */
  public getDrawableDynamicFlagIsVisible(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
    return Live2DCubismCore.Utils.hasIsVisibleBit(
      dynamicFlags[drawableIndex],
    );
  }

  /**
   * DrawableのDrawOrderの変化情報の取得
   *
   * 直近のCubismModel.update関数でdrawableのdrawOrderが変化したかを取得する。
   * drawOrderはartMesh上で指定する0から1000の情報
   * @param drawableIndex drawableのインデックス
   * @return true drawableの不透明度が直近のCubismModel.update関数で変化した
   * @return false drawableの不透明度が直近のCubismModel.update関数で変化している
   */
  public getDrawableDynamicFlagVisibilityDidChange(
    drawableIndex: number,
  ): boolean {
    const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
    return Live2DCubismCore.Utils.hasVisibilityDidChangeBit(
      dynamicFlags[drawableIndex],
    );
  }

  /**
   * Drawableの不透明度の変化情報の取得
   *
   * 直近のCubismModel.update関数でdrawableの不透明度が変化したかを取得する。
   *
   * @param drawableIndex drawableのインデックス
   * @return true Drawableの不透明度が直近のCubismModel.update関数で変化した
   * @return false Drawableの不透明度が直近のCubismModel.update関数で変化してない
   */
  public getDrawableDynamicFlagOpacityDidChange(
    drawableIndex: number,
  ): boolean {
    const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
    return Live2DCubismCore.Utils.hasOpacityDidChangeBit(
      dynamicFlags[drawableIndex],
    );
  }

  /**
   * Drawableの描画順序の変化情報の取得
   *
   * 直近のCubismModel.update関数でDrawableの描画の順序が変化したかを取得する。
   *
   * @param drawableIndex Drawableのインデックス
   * @return true Drawableの描画の順序が直近のCubismModel.update関数で変化した
   * @return false Drawableの描画の順序が直近のCubismModel.update関数で変化してない
   */
  public getDrawableDynamicFlagRenderOrderDidChange(
    drawableIndex: number,
  ): boolean {
    const dynamicFlags: Uint8Array = this._model.drawables.dynamicFlags;
    return Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(
      dynamicFlags[drawableIndex],
    );
  }

  /**
   * 保存されたパラメータの読み込み
   */
  public loadParameters(): void {
    let parameterCount: number = this._model.parameters.count;
    const savedParameterCount: number = this._savedParameters.length;

    if (parameterCount > savedParameterCount) {
      parameterCount = savedParameterCount;
    }

    for (let i = 0; i < parameterCount; ++i) {
      this._parameterValues[i] = this._savedParameters[i];
    }
  }

  /**
   * 初期化する
   */
  public initialize(): void {
    this._parameterValues = this._model.parameters.values;
    this._partOpacities = this._model.parts.opacities;
    this._parameterMaximumValues = this._model.parameters.maximumValues;
    this._parameterMinimumValues = this._model.parameters.minimumValues;

    {
      const parameterIds: string[] = this._model.parameters.ids;
      const parameterCount: number = this._model.parameters.count;

      for (let i = 0; i < parameterCount; ++i) {
        this._parameterIds.push(parameterIds[i]);
      }
    }

    {
      const partIds: string[] = this._model.parts.ids;
      const partCount: number = this._model.parts.count;

      for (let i = 0; i < partCount; ++i) {
        this._partIds.push(partIds[i]);
      }
    }

    {
      const drawableIds: string[] = this._model.drawables.ids;
      const drawableCount: number = this._model.drawables.count;

      for (let i = 0; i < drawableCount; ++i) {
        this._drawableIds.push(drawableIds[i]);
      }
    }
  }

  /**
   * コンストラクタ
   * @param model モデル
   */
  public constructor(model: Live2DCubismCore.Model) {
    this._model = model;
    this._savedParameters = [];
    this._parameterIds = [];
    this._drawableIds = [];
    this._partIds = [];

    this._notExistPartId = {};
    this._notExistParameterId = {};
    this._notExistParameterValues = {};
    this._notExistPartOpacities = {};

    this.initialize();
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    this._model.release();
    (this as any)._model = undefined;
  }

  private _notExistPartOpacities: Record<number, number>; // 存在していないパーツの不透明度のリスト
  private _notExistPartId: Record<string, number>; // 存在していないパーツIDのリスト

  private _notExistParameterValues: Record<number, number>; // 存在していないパラメータの値のリスト
  private _notExistParameterId: Record<string, number>; // 存在していないパラメータIDのリスト

  private _savedParameters: number[]; // 保存されたパラメータ

  private _model: Live2DCubismCore.Model; // モデル

  private _parameterValues!: Float32Array; // パラメータの値のリスト
  private _parameterMaximumValues!: Float32Array; // パラメータの最大値のリスト
  private _parameterMinimumValues!: Float32Array; // パラメータの最小値のリスト

  private _partOpacities!: Float32Array; // パーツの不透明度のリスト

  private _parameterIds: string[];
  private _partIds: string[];
  private _drawableIds: string[];
}
