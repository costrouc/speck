function glsl () {
    return {
        transform ( code, id ) {
            if ( !/\.glsl$/.test( id ) ) return;

            return 'export default ' + JSON.stringify(
                code
                    // .replace( /[ \t]*\/\/.*\n/g, '' )
                    // .replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
                    // .replace( /\n{2,}/g, '\n' )
            ) + ';';
        }
    };
}

export default {
    entry: 'src/main.js',
    dest: 'build/bundle.js',
    moduleName: 'Speck',
    format: 'umd',
    indent: '\t',
    plugins: [
        glsl()
    ]
};
