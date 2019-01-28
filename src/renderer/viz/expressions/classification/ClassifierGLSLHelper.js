export default class ClassifierGLSLHelper {
    constructor (classifier) {
        this.classifier = classifier;
    }

    applyToShaderSource (getGLSLforProperty) {
        const childSources = this.classifier.childrenNames.map(name => this.classifier[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => {
            childInlines[this.classifier.childrenNames[index]] = source.inline;
        });

        // Create classifier function
        const funcName = `classifier${this.classifier.classifierUID}`;

        const divisor = this.classifier.numCategories - 1 || 1;
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
                return ${(index / divisor).toFixed(20)};
            }`;
        const funcBody = this.classifier.breakpoints.map(elif).join('');

        const preface = `float ${funcName}(float x){
            ${funcBody}
            return 1.;
        }`;

        // GLSL preface & inline
        return {
            preface: this.classifier._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }
}
