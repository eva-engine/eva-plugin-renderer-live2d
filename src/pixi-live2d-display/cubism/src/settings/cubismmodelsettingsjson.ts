/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * Model3Jsonパーサー
 *
 * model3.jsonファイルをパースして値を取得する
 */
export class CubismModelSettingsJson {
  public constructor(json: CubismSpec.ModelJSON) {
    this.groups = json.Groups;
    this.hitAreas = json.HitAreas;
    this.layout = json.Layout;

    this.moc = json.FileReferences.Moc;
    this.expressions = json.FileReferences.Expressions;
    this.motions = json.FileReferences.Motions;
    this.textures = json.FileReferences.Textures;
    this.physics = json.FileReferences.Physics;
    this.pose = json.FileReferences.Pose;
  }

  public getEyeBlinkParameters(): string[] | undefined {
    return this.groups?.find(group => group.Name === 'EyeBlink')?.Ids;
  }

  public getLipSyncParameters(): string[] | undefined {
    return this.groups?.find(group => group.Name === 'LipSync')?.Ids;
  }

  groups?: CubismSpec.Group[];
  moc: string;
  expressions?: CubismSpec.Expression[];
  motions?: Record<string, CubismSpec.Motion[]>;
  textures: string[];
  physics?: string;
  pose?: string;
  hitAreas?: CubismSpec.HitArea[];
  layout?: CubismSpec.ModelJSON['Layout'];
}
