/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismRenderer } from './rendering/cubismrenderer';
import { CubismLogInfo, CubismLogWarning } from './utils/cubismdebug';

// ファイルスコープの変数を初期化

let s_isStarted = false;
let s_isInitialized = false;
let s_option: CubismStartupOption | undefined = undefined;

/**
 * Framework内で使う定数の宣言
 */
export namespace Constant {
  export const vertexOffset = 0; // メッシュ頂点のオフセット値
  export const vertexStep = 2; // メッシュ頂点のステップ値
}

/**
 * Live2D Cubism SDK Original Workflow SDKのエントリポイント
 * 利用開始時はCubismFramework.initialize()を呼び、CubismFramework.dispose()で終了する。
 */
export class CubismFramework {
  /**
   * Cubism FrameworkのAPIを使用可能にする。
   *  APIを実行する前に必ずこの関数を実行すること。
   *  一度準備が完了して以降は、再び実行しても内部処理がスキップされます。
   *
   * @param    option      Optionクラスのインスタンス
   *
   * @return   準備処理が完了したらtrueが返ります。
   */
  public static startUp(option?: CubismStartupOption): boolean {
    if (s_isStarted) {
      CubismLogInfo('CubismFramework.startUp() is already done.');
      return s_isStarted;
    }

    if ((Live2DCubismCore as any)._isStarted) {
      s_isStarted = true;
      return true;
    }

    (Live2DCubismCore as any)._isStarted = true;

    s_option = option;

    if (s_option) {
      Live2DCubismCore.Logging.csmSetLogFunction(s_option.logFunction);
    }

    s_isStarted = true;

    // Live2D Cubism Coreバージョン情報を表示
    if (s_isStarted) {
      const version: number = Live2DCubismCore.Version.csmGetVersion();
      const major: number = (version & 0xff000000) >> 24;
      const minor: number = (version & 0x00ff0000) >> 16;
      const patch: number = version & 0x0000ffff;
      const versionNumber: number = version;

      CubismLogInfo(
        `Live2D Cubism Core version: {0}.{1}.{2} ({3})`,
        ('00' + major).slice(-2),
        ('00' + minor).slice(-2),
        ('0000' + patch).slice(-4),
        versionNumber,
      );
    }

    CubismLogInfo('CubismFramework.startUp() is complete.');

    return s_isStarted;
  }

  /**
   * StartUp()で初期化したCubismFrameworkの各パラメータをクリアします。
   * Dispose()したCubismFrameworkを再利用する際に利用してください。
   */
  public static cleanUp(): void {
    s_isStarted = false;
    s_isInitialized = false;
    s_option = undefined;
  }

  /**
   * Cubism Framework内のリソースを初期化してモデルを表示可能な状態にします。<br>
   *     再度Initialize()するには先にDispose()を実行する必要があります。
   */
  public static initialize(): void {
    if (!s_isStarted) {
      CubismLogWarning('CubismFramework is not started.');
      return;
    }

    // --- s_isInitializedによる連続初期化ガード ---
    // 連続してリソース確保が行われないようにする。
    // 再度Initialize()するには先にDispose()を実行する必要がある。
    if (s_isInitialized) {
      CubismLogWarning(
        'CubismFramework.initialize() skipped, already initialized.',
      );
      return;
    }

    s_isInitialized = true;

    CubismLogInfo('CubismFramework.initialize() is complete.');
  }

  /**
   * Cubism Framework内の全てのリソースを解放します。
   *      ただし、外部で確保されたリソースについては解放しません。
   *      外部で適切に破棄する必要があります。
   */
  public static dispose(): void {
    if (!s_isStarted) {
      CubismLogWarning('CubismFramework is not started.');
      return;
    }

    // --- s_isInitializedによる未初期化解放ガード ---
    // dispose()するには先にinitialize()を実行する必要がある。
    if (!s_isInitialized) {
      // false...リソース未確保の場合
      CubismLogWarning('CubismFramework.dispose() skipped, not initialized.');
      return;
    }

    // レンダラの静的リソース（シェーダプログラム他）を解放する
    CubismRenderer.staticRelease();

    s_isInitialized = false;

    CubismLogInfo('CubismFramework.dispose() is complete.');
  }

  /**
   * Cubism FrameworkのAPIを使用する準備が完了したかどうか
   * @return APIを使用する準備が完了していればtrueが返ります。
   */
  public static isStarted(): boolean {
    return s_isStarted;
  }

  /**
   * Cubism Frameworkのリソース初期化がすでに行われているかどうか
   * @return リソース確保が完了していればtrueが返ります
   */
  public static isInitialized(): boolean {
    return s_isInitialized;
  }

  /**
   * Core APIにバインドしたログ関数を実行する
   *
   * @praram message ログメッセージ
   */
  public static coreLogFunction(message: string): void {
    // Return if logging not possible.
    if (!Live2DCubismCore.Logging.csmGetLogFunction()) {
      return;
    }

    Live2DCubismCore.Logging.csmGetLogFunction()(message);
  }

  /**
   * 現在のログ出力レベル設定の値を返す。
   *
   * @return  現在のログ出力レベル設定の値
   */
  public static getLoggingLevel(): LogLevel {
    if (s_option != null) {
      return s_option.loggingLevel;
    }
    return LogLevel.LogLevel_Off;
  }

  /**
   * 静的クラスとして使用する
   * インスタンス化させない
   */
  private constructor() {}
}

export interface CubismStartupOption {
  logFunction: Live2DCubismCore.csmLogFunction; // ログ出力の関数オブジェクト
  loggingLevel: LogLevel; // ログ出力レベルの設定
}

/**
 * ログ出力のレベル
 */
export enum LogLevel {
  LogLevel_Verbose = 0, // 詳細ログ
  LogLevel_Debug, // デバッグログ
  LogLevel_Info, // Infoログ
  LogLevel_Warning, // 警告ログ
  LogLevel_Error, // エラーログ
  LogLevel_Off // ログ出力無効
}
