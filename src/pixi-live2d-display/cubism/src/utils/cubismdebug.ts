/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismFramework, LogLevel } from '../live2dcubismframework';

export const CSM_ASSERT = process.env.NODE_ENV === 'production' ? () => {} : (expr: any) => console.assert(expr);

export function CubismLogVerbose(fmt: string, ...args: any[]) {
  CubismDebug.print(LogLevel.LogLevel_Verbose, '[CSM][V]' + fmt + '\n', args);
}

export function CubismLogDebug(fmt: string, ...args: any[]) {
  CubismDebug.print(LogLevel.LogLevel_Debug, '[CSM][D]' + fmt + '\n', args);
}

export function CubismLogInfo(fmt: string, ...args: any[]) {
  CubismDebug.print(LogLevel.LogLevel_Info, '[CSM][I]' + fmt + '\n', args);
}

export function CubismLogWarning(fmt: string, ...args: any[]) {
  CubismDebug.print(LogLevel.LogLevel_Warning, '[CSM][W]' + fmt + '\n', args);
}

export function CubismLogError(fmt: string, ...args: any[]) {
  CubismDebug.print(LogLevel.LogLevel_Error, '[CSM][E]' + fmt + '\n', args);
}

/**
 * デバッグ用のユーティリティクラス。
 * ログの出力、バイトのダンプなど
 */
export class CubismDebug {
  /**
   * ログを出力する。第一引数にログレベルを設定する。
   * CubismFramework.initialize()時にオプションで設定されたログ出力レベルを下回る場合はログに出さない。
   *
   * @param logLevel ログレベルの設定
   * @param format 書式付き文字列
   * @param args 可変長引数
   */
  public static print(
    logLevel: LogLevel,
    format: string,
    args?: any[],
  ): void {
    // オプションで設定されたログ出力レベルを下回る場合はログに出さない
    if (logLevel < CubismFramework.getLoggingLevel()) {
      return;
    }

    const logPrint: Live2DCubismCore.csmLogFunction = CubismFramework.coreLogFunction;

    if (!logPrint) return;

    const buffer: string = format.replace(/{(\d+)}/g, (m, k) => {
      return args![k];
    });
    logPrint(buffer);
  }

  /**
   * データから指定した長さだけダンプ出力する。
   * CubismFramework.initialize()時にオプションで設定されたログ出力レベルを下回る場合はログに出さない。
   *
   * @param logLevel ログレベルの設定
   * @param data ダンプするデータ
   * @param length ダンプする長さ
   */
  public static dumpBytes(
    logLevel: LogLevel,
    data: Uint8Array,
    length: number,
  ): void {
    for (let i = 0; i < length; i++) {
      if (i % 16 == 0 && i > 0) this.print(logLevel, '\n');
      else if (i % 8 == 0 && i > 0) this.print(logLevel, '  ');
      this.print(logLevel, '{0} ', [data[i] & 0xff]);
    }

    this.print(logLevel, '\n');
  }

  /**
   * private コンストラクタ
   */
  private constructor() {}
}
