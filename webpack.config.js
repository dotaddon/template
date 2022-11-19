const { dirname, join, resolve } = require( "path");
const { Configuration } = require( "webpack");
const { PanoramaManifestPlugin, PanoramaTargetPlugin } = require( 'webpack-panorama-x');
const TsconfigPathsPlugin = require( 'tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require( 'fork-ts-checker-webpack-plugin');
const { getAddonPath, RPGConfig } = require( "@mobilc/uitls");
const { xml } = require('./layout.config.json')

module.exports = {

    mode: "development",
    context: RPGConfig().srcPath.panorama,
    output: {
        path: join(getAddonPath().client, 'panorama', 'layout', 'custom_game'),
        publicPath: "file://{resources}/layout/custom_game/",
        chunkFormat: "commonjs",
    },

    module: {
        rules: [
            {
                test: /\.xml$/,
                loader: "webpack-panorama-x/lib/layout-loader",
            },
            {
                test: /\.[jt]sx$/,
                issuer: /\.xml$/,
                loader: "webpack-panorama-x/lib/entry-loader",
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: { transpileOnly: true },
            },
            {
                test: /\.js?$|\.jsx?$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /sync_keyvalues/],
                options: { presets: ["@babel/preset-react", "@babel/preset-env"] },
            },
            {
                test: /\.(css|less)$/,
                issuer: /\.xml$/,
                loader: "file-loader",
                options: { name: "[path][name].css", esModule: false },
            },
            {
                test: /\.less$/,
                loader: "less-loader",
                options: {
                    additionalData: (content) => content.replace(
                        /@keyframes\s*(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g,
                        (match, name) => match.replace(name, `'${name}'`)
                    ),
                    lessOptions: {
                        relativeUrls: false,
                    },
                },
            },
        ],
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", "..."],
        symlinks: false,
        plugins: [new TsconfigPathsPlugin({/* options: see below */ })]
    },

    plugins: [
        new PanoramaTargetPlugin(),
        new PanoramaManifestPlugin({
            entries: xml
                .map(e=>e.include)
                .flat()
                .map(e => ({ import: e }))
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: resolve(context, "tsconfig.json"),
            },
        }),
    ],
}