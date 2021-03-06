$(document).ready(function () {

    $('#search-tabs:not(.active)').children().on('click', activateTab);
    $('#search-box').on('input', updateSearch).trigger('focus');
    $('.category-box label input').on('change', updateSearch);

    noUiSlider.create($('#slider')[0], {
        start: [0, 1000],
        connect: true,
        range: {
            'min': 0,
            'max': 1000
        },
        tooltips: true,
        format: {
            to: function (value) {
                return '€' + value.toFixed(0);
            },
            from: function (value) {
                return value;
            }
        }
    });

    $('#slider')[0].noUiSlider.on('change', updateSearch);
    updateSearch();
});

function activateTab(event) {
    event.preventDefault();

    $(this).siblings('.active').removeClass('active').on('click', activateTab);
    let tab = $(this).children().attr('href');

    $('.search-container').hide();
    $(tab).show();

    $(this).addClass('active').off('click');
}

function updateSearch() {
    let query = $('#search-box').val();
    let categories = [];

    $('.category-box label input').each(function () {
        if ($(this).is(':checked'))
            categories.push($(this).val());
    });

    $('#restaurants').children().remove();
    $('#users').children().remove();

    let prices = $('#slider')[0].noUiSlider.get();

    // Needed because of issues of noUiSlider with format
    // https://github.com/leongersen/noUiSlider/issues/717
    for (let i = 0; i < prices.length; i++)
        prices[i] = parseFloat(prices[i].substring(1));

    $.ajax('../actions/search.php', {
        data: {
            query: query,
            categories: categories,
            prices: prices
        },
        dataType: 'json'
    }).done(buildResults)
        .fail(function (error) {
            console.log('Error retrieving search results.');
            console.log(error);
        });
}

function getRestaurantRating(restaurantId) {
    $.ajax('../actions/get_restaurant_average.php', {
        dataType: 'text',
        data: {
            restaurantId: restaurantId
        }
    }).done(function (response) {
        $('#restaurant' + restaurantId).html(getStarsHTML(response));
    }).fail(function (error) {
        console.log('Error getting restaurant rating.');
        console.log(error);
    });
}

function getStarsHTML(value) {
    if (value === null || value < 0)
        value = 0;
    else if (value > 5)
        value = 5;

    let fullStars = Math.floor(value);
    let halfStar = Math.floor(value * 2) % 2;

    let html = '';

    let i = 0;
    for (; i < fullStars; i++) {
        html += '<i class="star fa fa-star" aria-hidden="true"></i>';
    }

    if (halfStar) {
        html += '<i class="star fa fa-star-half-o" aria-hidden="true"></i>';
        i++;
    }

    for (; i < 5; i++) {
        html += '<i class="star fa fa-star-o" aria-hidden="true"></i>';
    }

    return html;
}

function buildResults(response) {
    $('#restaurants').children().remove();
    $('#users').children().remove();

    if (response['restaurants'].length === 0)
        $('#restaurants').append('<div class="container search-result">No results found</div>');
    else {
        for (let restaurant of response['restaurants']) {
            $('#restaurants').append(
                '<div class="container search-result" ' +
                'onclick="openRestaurantProfile(' + restaurant['ID'] + ')"' + '>' +
                '<span class="restaurant-name">' + restaurant['Name'] + '</span>' +
                '<span id="restaurant' + restaurant['ID'] + '" class="restaurant-average"></span>' +
                '<div class="restaurant-address">' + restaurant['Address'] + '</div>' +
                '</div>');
            getRestaurantRating(restaurant['ID']);
        }
    }

    if (response['users'].length === 0)
        $('#users').append('<div class="container search-result">No results found</div>');
    else {
        for (let user of response['users']) {
            $('#users').append(
                '<div class="container search-result" ' +
                'onclick="openUserProfile(' + user['ID'] + ')"' + '>' +
                '<span class="user-name">' + user['Name'] + '</span>' +
                '<div class="user-username">' + user['Username'] + '</div>' +
                '</div>');
        }
    }
}
