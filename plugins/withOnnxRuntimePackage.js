const { createRunOncePlugin, withMainApplication } = require('@expo/config-plugins');
const generateCode = require('@expo/config-plugins/build/utils/generateCode');

function withOnnxRuntimePackage(config) {
  return withMainApplication(config, (config) => {
    if (config.modResults.language !== 'kt') {
      return config;
    }

    let contents = generateCode.mergeContents({
      src: config.modResults.contents,
      newSrc: 'import ai.onnxruntime.reactnative.OnnxruntimePackage',
      tag: 'onnxruntime-react-native-import',
      anchor: /^import /m,
      offset: 0,
      comment: '//',
    }).contents;

    contents = generateCode.mergeContents({
      src: contents,
      newSrc: '              add(OnnxruntimePackage())',
      tag: 'onnxruntime-react-native-package',
      anchor: /PackageList\(this\)\.packages\.apply \{/,
      offset: 1,
      comment: '//',
    }).contents;

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = createRunOncePlugin(withOnnxRuntimePackage, 'with-onnx-runtime-package', '1.0.0');
