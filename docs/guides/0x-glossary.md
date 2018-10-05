# Glossary

## Implicit cast

A *implicit cast* is a transformation done automatically (implicitly) by one CARTO VL expression to another one. Its purpose is to provide *syntax sugar* over another expression which is equivalent but more verbose and difficult.

For example, when using `ramp($numericProperty, [red, blue])` the `ramp` expression will implicitly cast `$numericProperty` to `linear($numericProperty)`, and the `linear` expression will implicitly cast that to `linear($numericProperty, globalMin($numericProperty), globalMax($numericProperty))`, which is a much larger and more verbose form, but it is semantically the same.
