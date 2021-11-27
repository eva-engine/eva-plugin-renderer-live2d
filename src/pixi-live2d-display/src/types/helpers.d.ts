type JSONObject = object;

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
