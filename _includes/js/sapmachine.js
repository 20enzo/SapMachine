/*
Copyright (c) 2001-2018 by SAP SE, Walldorf, Germany.
All rights reserved. Confidential and proprietary.
*/

"use strict";

(function (window, document, $, ga, undefined) {

    function osComparator(a, b) {
        return a['ordinal'] - b['ordinal']
    }

    function SapMachine() {
        this._imageTypeSelector = $('#sapmachine_imagetype_select')
        this._osSelector = $('#sapmachine_os_select')
        this._downloadButton = $('#sapmachine_download_button')
        this._selectedImageType = null
        this._selectedOS = null
        this._selectedOSName = null
        this._assets = null

        this._updateImageTypeAndOS = function updateImageTypeAndOS() {
            if (this._imageTypeSelector.index() !== -1)
                this._selectedImageType = this._imageTypeSelector.val()

            if (this._osSelector.index() !== -1) {
                this._selectedOS = this._osSelector.val()
                this._selectedOSName = $("#sapmachine_os_select option:selected").text();
            }

            var imageType = 'JDK'

            if (this._selectedImageType.indexOf('jre') !== -1) {
                imageType = 'JRE'
            }

            var asset_available = this._assets[this._selectedImageType]['releases'][0].hasOwnProperty(this._selectedOS)

            this._downloadButton.text('Download "' + this._assets[this._selectedImageType]['releases'][0]['tag'] + ' ' + imageType + '" for ' + this._selectedOSName)
            this._downloadButton.prop('disabled', !asset_available)

            if (!asset_available) {
                this._downloadButton.addClass('download_button_disabled')
            } else {
                this._downloadButton.removeClass('download_button_disabled')
            }
        }.bind(this)

        this._imageTypeSelector.change(function imageTypeSelectorOnChange() {
            this._updateImageTypeAndOS()
        }.bind(this))

        this._osSelector.change(function osSelectorOnChange() {
            this._updateImageTypeAndOS()
        }.bind(this))

        this._downloadButton.click(function downloadButtonOnClick() {
            sendDownloadEvent(this._assets[this._selectedImageType]['releases'][0][this._selectedOS])
        }.bind(this))

        $.getJSON('assets/data/sapmachine_releases.json', function onJSONDataReceived(data) {
            for (var i in data.imageTypes.sort(function(a, b) {
                var aIsPreRelease = a.key.includes('-ea');
                var bIsPreRelease = b.key.includes('-ea');
                var re = /([0-9]+).*/;

                var aMajor = a.key.match(re)[1];
                var bMajor = b.key.match(re)[1];

                if ((aIsPreRelease && bIsPreRelease) ||
                    (!aIsPreRelease && !bIsPreRelease)) {
                    if (aMajor < bMajor) {
                        return 1;
                    }

                    if (aMajor > bMajor) {
                        return -1;
                    }

                    return 0;
                }

                if (!aIsPreRelease && bIsPreRelease) {
                    return -1;
                }

                if (aIsPreRelease && !bIsPreRelease) {
                    return 1;
                }

                return 0;
            })) {
                var optionElement = $('<option></option>')
                optionElement.text(data.imageTypes[i].value)
                optionElement.attr({'value': data.imageTypes[i].key })
                optionElement.addClass('download_select_option')
                this._imageTypeSelector.append(optionElement)
            }

            for (var i in data.os.sort(osComparator)) {
                var optionElement = $('<option></option>')
                optionElement.text(data.os[i].value)
                optionElement.attr({'value': data.os[i].key })
                optionElement.addClass('download_select_option')
                this._osSelector.append(optionElement)
            }

            this._assets = data.assets
            this._updateImageTypeAndOS()
        }.bind(this))
    }

    $(document).ready(function () {
        const sapMachine = new SapMachine()
    });

})(window, document, jQuery, ga)
