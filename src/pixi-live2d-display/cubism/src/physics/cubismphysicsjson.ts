/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismVector2 } from '../math/cubismvector2';

/**
 * physics3.jsonのコンテナ。
 */
export class CubismPhysicsJson {
  /**
   * コンストラクタ
   * @param json physics3.jsonが読み込まれているバッファ
   */
  public constructor(json: CubismSpec.PhysicsJSON) {
    this._json = json;
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    (this as Partial<this>)._json = undefined;
  }

  /**
   * 重力の取得
   * @return 重力
   */
  public getGravity(): CubismVector2 {
    const ret: CubismVector2 = new CubismVector2(0, 0);
    ret.x = this._json.Meta.EffectiveForces.Gravity.X;
    ret.y = this._json.Meta.EffectiveForces.Gravity.Y;
    return ret;
  }

  /**
   * 風の取得
   * @return 風
   */
  public getWind(): CubismVector2 {
    const ret: CubismVector2 = new CubismVector2(0, 0);
    ret.x = this._json.Meta.EffectiveForces.Wind.X;
    ret.y = this._json.Meta.EffectiveForces.Wind.Y;
    return ret;
  }

  /**
   * 物理店の管理の個数の取得
   * @return 物理店の管理の個数
   */
  public getSubRigCount(): number {
    return this._json.Meta.PhysicsSettingCount;
  }

  /**
   * 入力の総合計の取得
   * @return 入力の総合計
   */
  public getTotalInputCount(): number {
    return this._json.Meta.TotalInputCount;
  }

  /**
   * 出力の総合計の取得
   * @return 出力の総合計
   */
  public getTotalOutputCount(): number {
    return this._json.Meta.TotalOutputCount;
  }

  /**
   * 物理点の個数の取得
   * @return 物理点の個数
   */
  public getVertexCount(): number {
    return this._json.Meta.VertexCount;
  }

  /**
   * 正規化された位置の最小値の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 正規化された位置の最小値
   */
  public getNormalizationPositionMinimumValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Position.Minimum;
  }

  /**
   * 正規化された位置の最大値の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 正規化された位置の最大値
   */
  public getNormalizationPositionMaximumValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Position.Maximum;
  }

  /**
   * 正規化された位置のデフォルト値の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 正規化された位置のデフォルト値
   */
  public getNormalizationPositionDefaultValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Position.Default;
  }

  /**
   * 正規化された角度の最小値の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 正規化された角度の最小値
   */
  public getNormalizationAngleMinimumValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Angle.Minimum;
  }

  /**
   * 正規化された角度の最大値の取得
   * @param physicsSettingIndex
   * @return 正規化された角度の最大値
   */
  public getNormalizationAngleMaximumValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Angle.Maximum;
  }

  /**
   * 正規化された角度のデフォルト値の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 正規化された角度のデフォルト値
   */
  public getNormalizationAngleDefaultValue(
    physicsSettingIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Normalization.Angle.Default;
  }

  /**
   * 入力の個数の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 入力の個数
   */
  public getInputCount(physicsSettingIndex: number): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Input.length;
  }

  /**
   * 入力の重みの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param inputIndex 入力のインデックス
   * @return 入力の重み
   */
  public getInputWeight(
    physicsSettingIndex: number,
    inputIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Input[inputIndex].Weight;
  }

  /**
   * 入力の反転の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param inputIndex 入力のインデックス
   * @return 入力の反転
   */
  public getInputReflect(
    physicsSettingIndex: number,
    inputIndex: number,
  ): boolean {
    return this._json.PhysicsSettings[physicsSettingIndex].Input[inputIndex].Reflect;
  }

  /**
   * 入力の種類の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param inputIndex 入力のインデックス
   * @return 入力の種類
   */
  public getInputType(
    physicsSettingIndex: number,
    inputIndex: number,
  ): string {
    return this._json.PhysicsSettings[physicsSettingIndex].Input[inputIndex].Type;
  }

  /**
   * 入力元のIDの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param inputIndex 入力のインデックス
   * @return 入力元のID
   */
  public getInputSourceId(
    physicsSettingIndex: number,
    inputIndex: number,
  ): string {
    return this._json.PhysicsSettings[physicsSettingIndex].Input[inputIndex].Source.Id;
  }

  /**
   * 出力の個数の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @return 出力の個数
   */
  public getOutputCount(physicsSettingIndex: number): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Output.length;
  }

  /**
   * 出力の物理点のインデックスの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力の物理点のインデックス
   */
  public getOutputVertexIndex(
    physicsSettingIndex: number,
    outputIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].VertexIndex;
  }

  /**
   * 出力の角度のスケールを取得する
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力の角度のスケール
   */
  public getOutputAngleScale(
    physicsSettingIndex: number,
    outputIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].Scale;
  }

  /**
   * 出力の重みの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力の重み
   */
  public getOutputWeight(
    physicsSettingIndex: number,
    outputIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].Weight;
  }

  /**
   * 出力先のIDの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力先のID
   */
  public getOutputDestinationId(
    physicsSettingIndex: number,
    outputIndex: number,
  ): string {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].Destination.Id;
  }

  /**
   * 出力の種類の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力の種類
   */
  public getOutputType(
    physicsSettingIndex: number,
    outputIndex: number,
  ): string {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].Type;
  }

  /**
   * 出力の反転の取得
   * @param physicsSettingIndex 物理演算のインデックス
   * @param outputIndex 出力のインデックス
   * @return 出力の反転
   */
  public getOutputReflect(
    physicsSettingIndex: number,
    outputIndex: number,
  ): boolean {
    return this._json.PhysicsSettings[physicsSettingIndex].Output[outputIndex].Reflect;
  }

  /**
   * 物理点の個数の取得
   * @param physicsSettingIndex 物理演算男設定のインデックス
   * @return 物理点の個数
   */
  public getParticleCount(physicsSettingIndex: number): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Vertices.length;
  }

  /**
   * 物理点の動きやすさの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param vertexIndex 物理点のインデックス
   * @return 物理点の動きやすさ
   */
  public getParticleMobility(
    physicsSettingIndex: number,
    vertexIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Mobility;
  }

  /**
   * 物理点の遅れの取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param vertexIndex 物理点のインデックス
   * @return 物理点の遅れ
   */
  public getParticleDelay(
    physicsSettingIndex: number,
    vertexIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Delay;
  }

  /**
   * 物理点の加速度の取得
   * @param physicsSettingIndex 物理演算の設定
   * @param vertexIndex 物理点のインデックス
   * @return 物理点の加速度
   */
  public getParticleAcceleration(
    physicsSettingIndex: number,
    vertexIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Acceleration;
  }

  /**
   * 物理点の距離の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param vertexIndex 物理点のインデックス
   * @return 物理点の距離
   */
  public getParticleRadius(
    physicsSettingIndex: number,
    vertexIndex: number,
  ): number {
    return this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Radius;
  }

  /**
   * 物理点の位置の取得
   * @param physicsSettingIndex 物理演算の設定のインデックス
   * @param vertexIndex 物理点のインデックス
   * @return 物理点の位置
   */
  public getParticlePosition(
    physicsSettingIndex: number,
    vertexIndex: number,
  ): CubismVector2 {
    const ret: CubismVector2 = new CubismVector2(0, 0);
    ret.x = this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Position.X;
    ret.y = this._json.PhysicsSettings[physicsSettingIndex].Vertices[vertexIndex].Position.Y;
    return ret;
  }

  _json: CubismSpec.PhysicsJSON; // physics3.jsonデータ
}
