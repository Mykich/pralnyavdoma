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
                return i ? '<li><span>' + esc(i.name) + '</span><span class="price">' + fmt(i) + '</span></li>' : '';
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

        var d = data.delivery;
        if (d) {
            var tb = document.querySelector('[data-delivery]');
            if (tb && d.zones) tb.innerHTML = d.zones.map(function (z) {
                var cost = z.price ? '<strong>' + z.price + ' ₴</strong>' + (z.free_from ? '<small>безкоштовно від ' + z.free_from + ' ₴</small>' : '') : '<strong>Безкоштовно</strong>';
                return '<tr><td>' + esc(z.name) + '</td><td>' + cost + '</td></tr>';
            }).join('');
            if (d.min_order_outside) document.querySelectorAll('[data-delivery-min]').forEach(function (el) { el.textContent = d.min_order_outside; });
            if (d.turnaround) document.querySelectorAll('[data-turnaround]').forEach(function (el) { el.textContent = d.turnaround; });
        }

        var club = document.querySelector('[data-club]');
        if (club && data.club) club.innerHTML = data.club.map(function (c) {
            return '<li><strong>' + c.discount + '%</strong> від ' + c.from + ' ₴</li>';
        }).join('');

        var insp = document.querySelector('[data-inspection]');
        if (insp && data.inspection_only && data.inspection_only.length) {
            var t = data.inspection_only.join(', ');
            insp.textContent = t.charAt(0).toUpperCase() + t.slice(1) + '.';
        }
    }

    if (!window.fetch) return;
    fetch(API).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
    }).then(render).catch(function () { /* лишаємо статичну копію */ });
})();
