
module.exports = function(api) {

    // api.env("production")
  
    api.cache(true);
  
    return {
      presets: [
        [
          require("@babel/preset-env"), {
            // browserslist: If commented, uses browsers from package.json/browserslist
            targets: [
              "Explorer >= 11",
              "Edge >= 40",
              "Safari >= 10",
              "Firefox >= 58",
              "Chrome >= 64"
            ],

            // Need core-js to be loaded up-front.
            useBuiltIns: false
          }
        ]
      ],
      plugins: [
        require("@babel/plugin-transform-member-expression-literals"),
        require("@babel/plugin-transform-property-literals"),
        [require("@babel/plugin-proposal-object-rest-spread"), {
          useBuiltIns: true
        }],
        [require("@babel/plugin-transform-runtime"), {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: false
        }],
        require("babel-plugin-transform-es2015-modules-simple-amd")
      ],
      // Due to https://github.com/babel/babel/issues/5261
      // must be specified through the cli...
      // sourceMaps: true,
      sourceType: "unambiguous",
      minified: true
    };
  };
