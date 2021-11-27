/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from './cubismmatrix44';

/**
 * モデル座標設定用の4x4行列
 *
 * モデル座標設定用の4x4行列クラス
 */
export class CubismModelMatrix extends CubismMatrix44 {
  /**
   * コンストラクタ
   *
   * @param w 横幅
   * @param h 縦幅
   */
  constructor(w?: number, h?: number) {
    super();

    this._width = w !== undefined ? w : 0.0;
    this._height = h !== undefined ? h : 0.0;

    this.setHeight(1.0);
  }

  /**
   * 横幅を設定
   *
   * @param w 横幅
   */
  public setWidth(w: number): void {
    const scaleX: number = w / this._width;
    const scaleY: number = scaleX;
    this.scale(scaleX, scaleY);
  }

  /**
   * 縦幅を設定
   * @param h 縦幅
   */
  public setHeight(h: number): void {
    const scaleX: number = h / this._height;
    const scaleY: number = scaleX;
    this.scale(scaleX, scaleY);
  }

  /**
   * 位置を設定
   *
   * @param x X軸の位置
   * @param y Y軸の位置
   */
  public setPosition(x: number, y: number): void {
    this.translate(x, y);
  }

  /**
   * 中心位置を設定
   *
   * @param x X軸の中心位置
   * @param y Y軸の中心位置
   *
   * @note widthかheightを設定したあとでないと、拡大率が正しく取得できないためずれる。
   */
  public setCenterPosition(x: number, y: number) {
    this.centerX(x);
    this.centerY(y);
  }

  /**
   * 上辺の位置を設定する
   *
   * @param y 上辺のY軸位置
   */
  public top(y: number): void {
    this.setY(y);
  }

  /**
   * 下辺の位置を設定する
   *
   * @param y 下辺のY軸位置
   */
  public bottom(y: number) {
    const h: number = this._height * this.getScaleY();

    this.translateY(y - h);
  }

  /**
   * 左辺の位置を設定
   *
   * @param x 左辺のX軸位置
   */
  public left(x: number): void {
    this.setX(x);
  }

  /**
   * 右辺の位置を設定
   *
   * @param x 右辺のX軸位置
   */
  public right(x: number): void {
    const w = this._width * this.getScaleX();

    this.translateX(x - w);
  }

  /**
   * X軸の中心位置を設定
   *
   * @param x X軸の中心位置
   */
  public centerX(x: number): void {
    const w = this._width * this.getScaleX();

    this.translateX(x - w / 2.0);
  }

  /**
   * X軸の位置を設定
   *
   * @param x X軸の位置
   */
  public setX(x: number): void {
    this.translateX(x);
  }

  /**
   * Y軸の中心位置を設定
   *
   * @param y Y軸の中心位置
   */
  public centerY(y: number): void {
    const h: number = this._height * this.getScaleY();

    this.translateY(y - h / 2.0);
  }

  /**
   * Y軸の位置を設定する
   *
   * @param y Y軸の位置
   */
  public setY(y: number): void {
    this.translateY(y);
  }

  /**
   * レイアウト情報から位置を設定
   *
   * @param layout レイアウト情報
   */
  public setupFromLayout(layout: Record<string, number>): void {
    for (const [key, value] of Object.entries(layout)) {
      switch (key) {
        case 'width':
          this.setWidth(value);
          break;
        case 'height':
          this.setHeight(value);
          break;
        case 'x':
          this.setX(value);
          break;
        case 'y':
          this.setY(value);
          break;
        case 'center_x':
          this.centerX(value);
          break;
        case 'center_y':
          this.centerY(value);
          break;
        case 'top':
          this.top(value);
          break;
        case 'bottom':
          this.bottom(value);
          break;
        case 'left':
          this.left(value);
          break;
        case 'right':
          this.right(value);
          break;
      }
    }
  }

  private _width: number; // 横幅
  private _height: number; // 縦幅
}
