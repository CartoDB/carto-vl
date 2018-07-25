/**
 * Keep a cacheTo avoid recompiling webgl programs and shaders.
 * We need a different shader per webgl context so we use a 2 level cache where at the first level
 * the webgl context is the key and at the second level the shader code is the cache key.
 */
export default class Cache {
    constructor () {
        this.caches = new WeakMap();
    }

    get (gl, shadercode) {
        if (this.caches.has(gl)) {
            let cache = this.caches.get(gl);

            return cache[shadercode];
        }
    }

    set (gl, shadercode, shader) {
        if (this.caches.has(gl)) {
            let cache = this.caches.get(gl);
            cache[shadercode] = shader;
        } else {
            let cache = {};
            cache[shadercode] = shader;
            this.caches.set(gl, cache);
        }
    }

    has (gl, shadercode) {
        return this.get(gl, shadercode) !== undefined;
    }
}
