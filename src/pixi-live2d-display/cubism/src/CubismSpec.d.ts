declare namespace CubismSpec {
  export interface ModelJSON {
    /**
     * Json file format version.
     */
    Version: number;
    /**
     * Relative paths from the model3.json to other files.
     */
    FileReferences: {
      /**
       * Relative path to the moc3 file.
       */
      Moc: string;
      /**
       * Relative paths to the textures.
       */
      Textures: string[];
      /**
       * [Optional] Relative path to the physics3.json file.
       */
      Physics?: string;
      /**
       * [Optional] Relative path to the userdata3.json file.
       */
      UserData?: string;
      /**
       * [Optional] Relative path to the pose3.json file.
       */
      Pose?: string;
      /**
       * [Optional] Relative path to the cdi3.json file.
       */
      DisplayInfo?: string;
      /**
       * [Optional] Relative path to the exp3.json file.
       */
      Expressions?: Expression[];
      /**
       * [Optional] Relative path to the motion3.json file.
       */
      Motions?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` ".+".
         */
        [k: string]: Motion[];
      };
    };
    /**
     * [Optional] groups.
     */
    Groups?: Group[];
    /**
     * [Optional]Collision detection
     */
    HitAreas?: HitArea[];
    /**
     * [Optional]Layout
     */
    Layout?: {
      Width?: number;
      Height?: number;
      X?: number;
      Y?: number;
      CenterX?: number;
      CenterY?: number;
    };
  }

  /**
   * Motion.
   */
  export interface Motion {
    /**
     * File name.
     */
    File: string;
    /**
     * [Optional] Time of the Fade-out for motion easing in seconds.
     */
    FadeOutTime?: number;
    /**
     * [Optional] Time of the Fade-In for motion easing in seconds..
     */
    FadeInTime?: number;
    /**
     * [Optional] Audio files playback with motion.
     */
    Sound?: string;
  }

  /**
   * Group entry.
   */
  export interface Group {
    /**
     * Target of group.
     */
    Target: {
      [k: string]: unknown;
    };
    /**
     * Unique name of group.
     */
    Name: string;
    /**
     * IDs for mapping to target.
     */
    Ids: string[];
  }

  /**
   * Collision detection.
   */
  export interface HitArea {
    /**
     * Unique name of group.
     */
    Name: string;
    /**
     * IDs for mapping to target.
     */
    Id: string;
  }

  export interface Expression {
    Name: string;
    File: string;
  }

  export interface MotionJSON {
    /**
     * Json file format version.
     */
    Version: number;
    /**
     * Additional data describing the motion.
     */
    Meta: {
      /**
       * Duration of the motion in seconds.
       */
      Duration: number;
      /**
       * Framerate of the motion in seconds.
       */
      Fps: number;
      /**
       * [Optional] Status of the looping of the motion.
       */
      Loop?: boolean;
      /**
       * [Optional] Status of the restriction of Bezier handles'X translations.
       */
      AreBeziersRestricted?: boolean;
      /**
       * [Optional] Time of the overall Fade-In for easing in seconds.
       */
      FadeInTime?: number;
      /**
       * [Optional] Time of the overall Fade-Out for easing in seconds.
       */
      FadeOutTime?: number;
      /**
       * The total number of curves.
       */
      CurveCount: number;
      /**
       * The total number of segments (from all curves).
       */
      TotalSegmentCount: number;
      /**
       * The total number of points (from all segments of all curves).
       */
      TotalPointCount: number;
      /**
       * [Optional] The total number of UserData.
       */
      UserDataCount?: number;
      /**
       * [Optional] The total size of UserData in bytes.
       */
      TotalUserDataSize?: number;
    };
    /**
     * Motion curves.
     */
    Curves: Curve[];
    /**
     * [Optional] User data.
     */
    UserData?: {
      /**
       * Time in seconds.
       */
      Time: number;
      /**
       * Content of user data.
       */
      Value: string;
    }[];
  }

  /**
   * Single curve.
   */
  export interface Curve {
    /**
     * Target type.
     */
    Target: string;
    /**
     * Identifier for mapping curve to target.
     */
    Id: string;
    /**
     * [Optional] Time of the Fade-In for easing in seconds.
     */
    FadeInTime?: number;
    /**
     * [Optional] Time of the Fade-Out for easing in seconds.
     */
    FadeOutTime?: number;
    /**
     * Flattened segments.
     */
    Segments: number[];
  }

  export interface ExpressionJSON {
    /**
     * Json file format type.
     */
    Type: 'Live2D Expression';
    /**
     * [Optional] Time of the Fade-In for easing in seconds.
     */
    FadeInTime?: number;
    /**
     * [Optional] Time of the Fade-Out for easing in seconds.
     */
    FadeOutTime?: number;
    Parameters: {
      Id: string;
      Value: number;
      Blend?: 'Add' | 'Multiply' | 'Overwrite';
    }[];
  }

  export interface PhysicsJSON {
    /**
     * Physics Settings.
     */
    PhysicsSettings: {
      /**
       * Identifier for Physics settings(each model is different).
       */
      Id: string;
      /**
       * Input.
       */
      Input: {
        /**
         * Targeted parameter.
         */
        Source: {
          /**
           * Target type.
           */
          Target: string;
          /**
           * Parameter ID.
           */
          Id: string;
        };
        /**
         * Effectiveness:propotion of each type（0～100%）.
         */
        Weight: number;
        /**
         * Type X or Angle.
         */
        Type: string;
        /**
         * Reflect.
         */
        Reflect: boolean;
      }[];
      /**
       * Output.
       */
      Output: {
        /**
         * Targeted parameter.
         */
        Destination: {
          /**
           * Target type.
           */
          Target: string;
          /**
           * Parameter ID.
           */
          Id: string;
        };
        /**
         * Number（0 origin） of parent pendulum（Vertex）.
         */
        VertexIndex: number;
        /**
         * Scale
         */
        Scale: number;
        /**
         * Effectiveness:propotion of each type（0～100%）.
         */
        Weight: number;
        /**
         * Type X or Angle (Angle might be fixed)
         */
        Type: string;
        /**
         * Reflect
         */
        Reflect: boolean;
      }[];
      /**
       * Array of the pendulums
       */
      Vertices: Vertex[];
      /**
       * Parameter(input value normalized).
       */
      Normalization: {
        /**
         * Normalization value of position.
         */
        Position: {
          /**
           * Normalized minimum.
           */
          Minimum: number;
          /**
           * Center of the range of normalization.
           */
          Default: number;
          /**
           * Normalized maximum.
           */
          Maximum: number;
        };
        /**
         * Normalization value of angle.
         */
        Angle: {
          /**
           * Normalized minimum.
           */
          Minimum: number;
          /**
           * Center of the range of normalization.
           */
          Default: number;
          /**
           * Normalized maximum.
           */
          Maximum: number;
        };
      };
    }[];
    /**
     * Json file format version.
     */
    Version: number;
    /**
     * Additional data describing the physics.
     */
    Meta: {
      /**
       * Number of physics settings.
       */
      PhysicsSettingCount: number;
      /**
       * Total number of input parameters.
       */
      TotalInputCount: number;
      /**
       * Total number of output parameters.
       */
      TotalOutputCount: number;
      /**
       * Total number of vertices.
       */
      VertexCount: number;
      /**
       * Settings of gravity and wind.
       */
      EffectiveForces: {
        /**
         * Gravity.
         */
        Gravity: {
          X: number;
          Y: number;
        };
        /**
         * Wind.
         */
        Wind: {
          X: number;
          Y: number;
        };
      };
      /**
       * List of names and identifiers of Physics setting.
       */
      PhysicsDictionary: {
        /**
         * Identifier for Physics settings(each model is different).
         */
        Id: string;
        /**
         * Name of Physics settings(group name).
         */
        Name: string;
      }[];
    };
  }

  /**
   * Single vertex.
   */
  export interface Vertex {
    /**
     * Default position.
     */
    Position: {
      X: number;
      Y: number;
    };
    /**
     * Shaking influence.
     */
    Mobility: number;
    /**
     * Reaction time.
     */
    Delay: number;
    /**
     * Overall acceleration.
     */
    Acceleration: number;
    /**
     * Radius of pendulum.
     */
    Radius: number;
  }

  export interface PoseJSON {
    Type: 'Live2D Pose';
    /**
     * Time of the Fade-In for easing in seconds.
     */
    FadeInTime?: number;
    /**
     * List of the switching control groups.
     */
    Groups: {
      /**
       * Main switching Part ID.
       */
      Id: string;
      /**
       * List of the linked switching Part IDs.
       */
      Link?: string[];
    }[][];
  }

  export interface UserDataJSON {
    /**
     * Json file format version.
     */
    Version: number;
    /**
     * Additional data describing the user data.
     */
    Meta: {
      /**
       * The total number of UserData.
       */
      UserDataCount: number;
      /**
       * The total size of UserData in bytes.
       */
      TotalUserDataSize: number;
    };
    /**
     * User data.
     */
    UserData: UserData[];
  }

  /**
   * User data.
   */
  export interface UserData {
    /**
     * Target type.
     */
    Target: string;
    /**
     * Identifier for mapping to target.
     */
    Id: string;
    /**
     * Content of user data.
     */
    Value: string;
  }
}
