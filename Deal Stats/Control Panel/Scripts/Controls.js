var Intelligize;
(function (Intelligize) {
    (function (QC) {
        var Controls = (function () {
            function Controls() {
            }
            Controls.prototype.composeObject = function (rawObject, html) {
                var obj = {
                };
                for (var key in rawObject) {
                    if ($.isPlainObject(rawObject[key])) {
                        obj[key] = this.composeObject(rawObject[key], html);
                    } else {
                        obj[key] = html.find(rawObject[key]);
                    }
                }
                return obj;
            };
            return Controls;
        })();
        QC.Controls = Controls;
    })(Intelligize.QC || (Intelligize.QC = {}));
    var QC = Intelligize.QC;

})(Intelligize || (Intelligize = {}));

// test2
