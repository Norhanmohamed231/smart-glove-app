const { createRunOncePlugin, withMainApplication } = require('@expo/config-plugins');
const generateCode = require('@expo/config-plugins/build/utils/generateCode');

function withSttPackInstaller(config) {
  return withMainApplication(config, (config) => {
    if (config.modResults.language !== 'kt') {
      return config;
    }

    let contents = generateCode.mergeContents({
      src: config.modResults.contents,
      newSrc: 'import com.signtalker.app.stt.SttPackInstallerPackage',
      tag: 'stt-pack-installer-import',
      anchor: /^import /m,
      offset: 0,
      comment: '//',
    }).contents;

    contents = generateCode.mergeContents({
      src: contents,
      newSrc: '              add(SttPackInstallerPackage())',
      tag: 'stt-pack-installer-package',
      anchor: /PackageList\(this\)\.packages\.apply \{/,
      offset: 1,
      comment: '//',
    }).contents;

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = createRunOncePlugin(withSttPackInstaller, 'with-stt-pack-installer', '1.0.0');
