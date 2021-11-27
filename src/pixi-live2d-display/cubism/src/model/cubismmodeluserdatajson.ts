/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export class CubismModelUserDataJson {
  /**
   * コンストラクタ
   * @param json    userdata3.jsonが読み込まれているバッファ
   * @param size      バッファのサイズ
   */
  public constructor(json: CubismSpec.UserDataJSON, size: number) {
    this._json = json;
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    (this as any)._json = undefined;
  }

  /**
   * ユーザーデータ個数の取得
   * @return ユーザーデータの個数
   */
  public getUserDataCount(): number {
    return this._json.Meta.UserDataCount;
  }

  /**
   * ユーザーデータ総文字列数の取得
   *
   * @return ユーザーデータ総文字列数
   */
  public getTotalUserDataSize(): number {
    return this._json.Meta.TotalUserDataSize;
  }

  /**
   * ユーザーデータのタイプの取得
   *
   * @return ユーザーデータのタイプ
   */
  public getUserDataTargetType(i: number): string {
    return this._json.UserData[i].Target;
  }

  /**
   * ユーザーデータのターゲットIDの取得
   *
   * @param i インデックス
   * @return ユーザーデータターゲットID
   */
  public getUserDataId(i: number): string {
    return this._json.UserData[i].Id;
  }

  /**
   * ユーザーデータの文字列の取得
   *
   * @param i インデックス
   * @return ユーザーデータ
   */
  public getUserDataValue(i: number): string {
    return this._json.UserData[i].Value;
  }

  private _json: CubismSpec.UserDataJSON;
}
