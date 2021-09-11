const toCurrency = price => {
    return new Intl.NumberFormat('ru-Ru', {
        currency: 'rub',
        style: 'currency'
    }).format(+price)
}
document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent);
    // node.textContent = new Intl.NumberFormat('ru-Ru', {
    //     currency: 'rub',
    //     style: 'currency'
    // }).format(+node.textContent)
});

const $card = document.querySelector('#card');

if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            // console.log(id)
            fetch('/card/remove/' + id, {
                method: 'delete'
            }).then(res => res.json())
                .then(card => {
                    // console.log(card)
                    if (card.courses.length) {
                        const html = card.courses.map(c => {
                            return `
                                <tr>
                                    <td>${c.title}</td>
                                    <td>${c.count}</td>
                                    <td>
                                        <button data-id="${c.id}" class="btn btn-small js-remove">
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('');
                        $card.querySelector('tbody').innerHTML = html;
                        $card.querySelector('.price').textContent = toCurrency(card.price);
                    } else {
                        $card.innerHTML = '<p>Корзина пуста</p>';
                    }
                    console.log(card, 'fetch')
                })
        }
    });
};


M.Tabs.init(document.querySelectorAll('.tabs'));