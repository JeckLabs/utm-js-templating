var UTM = {
    getUTMVars: function () {
        var storageVars = localStorage.getItem('utm_template_vars');
        if (storageVars !== null) {
            return JSON.parse(storageVars)
        }
        if (localStorage.getItem('utm_returned_user')) {
            return {}
        }
        var parser = document.createElement('a');
        parser.href = document.location;

        var queries = parser.search.replace(/^\?/, '').split('&');
        var split, key, value;
        storageVars = {};
        for(var i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=', 2);
            key = split[0];
            value = split[1];
            if (!key.match(/^utm_/i)) {
                continue
            }
            key = key.replace(/^utm_/i, '').toLowerCase();
            storageVars[key] = value;
        }
        if (Object.keys(storageVars).length > 0) {
            localStorage.setItem('utm_returned_user', '1');
            localStorage.setItem('utm_template_vars', JSON.stringify(storageVars));
        }
        return storageVars
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
            [/^https?:\/\/(www\.)?google\.\w+(?:\/|$)/im, 'data-for-google', 'utm_from_google'],
            [/^https?:\/\/(www\.)?yandex\.\w+(?:\/|$)/im, 'data-for-yandex', 'utm_from_yandex']
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

        var regexp, attrName, localStorageKey;
        var returnedUser = localStorage.getItem('utm_returned_user');
        referrersMap.forEach(function (pair) {
            regexp = pair[0];
            attrName = pair[1];
            localStorageKey = pair[2];
            if (localStorage.getItem(localStorageKey) || (!returnedUser && document.referrer.match(regexp))) {
                localStorage.setItem('utm_returned_user', '1');
                localStorage.setItem(localStorageKey, '1');
                elements = document.querySelectorAll('*[' + attrName + ']');
                elements.forEach(function (e) {
                    e.textContent = e.getAttribute(attrName);
                });
            }
        })
    }
};
