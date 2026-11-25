// Прайс сайту з єдиного джерела цін (mini/catalog/prices.json через API).
// У HTML уже є статична копія (для SEO і якщо API спить) — скрипт лише оновлює її свіжими даними.
// Розмітка має збігатися з tools/build_prices.py.
(function () {
    var API = 'https://mini-mrip.onrender.com/api/prices';

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function fmt(item) {
        var unit = item.unit && item.unit !== 'шт' ? ' / ' + item.unit : '';
        return item.price + ' ₴' + unit;
    }
    function render(data) {
        var byId = {};
        data.items.forEach(function (i) { byId[i.id] = i; });
        var titles = {};
        data.sections.forEach(function (s) { titles[s.key] = s.title; });

        document.querySelectorAll('[data-price-ids]').forEach(function (ul) {
            var html = ul.getAttribute('data-price-ids').split(',').map(function (id) {
                var i = byId[Number(id)];
                return i ? '<li>' + esc(i.name) + ' — ' + fmt(i) + '</li>' : '';
            }).join('');
            if (html) ul.innerHTML = html;
        });

        document.querySelectorAll('[data-price-sections]').forEach(function (tbody) {
            var keys = tbody.getAttribute('data-price-sections').split(',');
            var html = keys.map(function (key, n) {
                var rows = data.items.filter(function (i) { return i.section === key; });
                if (!rows.length) return '';
                var head = n > 0 ? '<tr><td colspan="2" class="modal__table-group">' + esc(titles[key] || key) + '</td></tr>' : '';
                return head + rows.map(function (i) {
                    return '<tr><td>' + esc(i.name) + '</td><td>' + fmt(i) + '</td></tr>';
                }).join('');
            }).join('');
            if (html) tbody.innerHTML = html;
        });

        var b2b = document.querySelector('[data-price-b2b]');
        if (b2b && data.b2b) {
            var from = data.b2b.price_from ? 'від ' : '';
            var rows = data.b2b.items.slice(0, 3).map(function (i) {
                return '<li>' + esc(i.name) + ' — ' + from + i.price + ' ₴ / ' + esc(data.b2b.unit) + '</li>';
            }).join('');
            rows += '<li>Мінімальне B2B-замовлення — ' + data.b2b.min_kg + ' кг або ' + data.b2b.min_amount + ' ₴</li>';
            b2b.innerHTML = rows;
        }
    }

    if (!window.fetch) return;
    fetch(API).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
    }).then(render).catch(function () { /* лишаємо статичну копію */ });
})();
