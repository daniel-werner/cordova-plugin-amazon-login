#!/usr/bin/env node

var fs    = require('fs');     // nodejs.org/api/fs.html
var path  = require('path');
var plist = require('plist');  // www.npmjs.com/package/plist
var elTree = require('elementtree');

module.exports = function (context) {
     // This script is only for iOS
    if (context.opts.platforms.indexOf('ios') < 0) {
        return;
    }
    // Read from config.xml to get bundle id
    var configXml = path.join(context.opts.projectRoot, 'config.xml');
    // var elTree = context.requireCordovaModule('elementtree');

    var data = fs.readFileSync(configXml, 'utf8').toString();
    // Cleanze BOM if exists
    data = data.replace(/^\uFEFF/, '');
    var xmlDoc = elTree.parse(data);
    
    // Load up the plist resource file
    var projectName = xmlDoc.getroot().find('name').text;
    var plistFilepath = 'platforms/ios/' + projectName + '/' + projectName + '-Info.plist';
    var xml = fs.readFileSync(plistFilepath, 'utf8');
    var plistDoc = plist.parse(xml);
      
    // Set the new Amazon Alexa's URL scheme that is based off app's bundle id
    if (typeof plistDoc.CFBundleURLTypes == 'undefined' || plistDoc.CFBundleURLTypes == null) {
      plistDoc.CFBundleURLTypes = [];
    }
    plistDoc.CFBundleURLTypes.push( {
      "CFBundleURLSchemes": [ 'amzn-' + xmlDoc.getroot().attrib.id ]
    } );

    // Make it so 
    xml = plist.build(plistDoc);
    fs.writeFileSync(plistFilepath, xml, { encoding: 'utf8' });
};
