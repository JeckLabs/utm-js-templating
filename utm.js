var UTM = {
    getUTMVars: function () {
        var parser = document.createElement('a');
        parser.href = document.location;

        var queries = parser.search.replace(/^\?/, '').split('&');
        var split, key, value;
        var params = {};
        for(var i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=', 2);
            key = split[0];
            value = split[1];
            if (!key.match(/^utm_/i)) {
                continue
            }
            key = key.replace(/^utm_/i, '').toLowerCase();
            params[key] = value;
        }

        return params
    },
    renderTemplate: function (template, vars) {
        return template.replace(/\${(.*?)}/gi, function (match, contents) {
            var pair = contents.split(':', 2);
            var defaultValue = '';
            var key = pair[0];
            if (pair.length === 2) {
                defaultValue = pair[1];
            }
            return vars[key] || defaultValue;
        })
    },
    init: function () {
        var templateVars = this.getUTMVars();

        var referrersMap = [
            [/^https?:\/\/(www\.)?google\.\w+(?:\/|$)/im, 'data-for-google'],
            [/^https?:\/\/(www\.)?yandex\.\w+(?:\/|$)/im, 'data-for-yandex']
        ];

        var elements;
        if (Object.keys(templateVars).length > 0) {
            elements = document.querySelectorAll('*[data-for-utm]');
            elements.forEach(function (e) {
                var template = e.getAttribute('data-for-utm');
                e.textContent = this.renderTemplate(template, templateVars);
            }.bind(this));
            return
        }

        var regexp, attrName;
        referrersMap.forEach(function (pair) {
            regexp = pair[0];
            console.log(regexp, document.referrer, document.referrer.match(regexp));
            if (!document.referrer.match(regexp)) {
                return
            }
            attrName = pair[1];
            elements = document.querySelectorAll('*[' + attrName + ']');
            elements.forEach(function (e) {
                e.textContent = e.getAttribute(attrName);
            });
        })
    }
};
