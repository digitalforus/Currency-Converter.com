
if (navigator.serviceWorker) {

    navigator.serviceWorker.register('./sw.js').then(registration => {
        console.log("Registered");
    })
    .catch(err => {
        console.log("Registration failed", err);
    })

}





$(document).ready(function () {
    let countries = {};

    //fetches all countries and append as options
    fetch('https://free.currencyconverterapi.com/api/v5/countries').then(response => response.json())
    .then(json_files => {
        let options = '';
        countries = Object.values(json_files.results);
        for (let country of countries) {
            options += `<option class="blue" value="${country.currencyId}">${country.currencyName}</option>`;    
        }
        $("#from").append(options);
        $("#to").append(options);
    });


    //currency conversion
    convert = () => {
        if (!navigator.onLine) {
            $("#ansErr").html("Currency will be converted when you are online");
        }
        else {
            const amount = $("#amount").val();
            const from = $("#from").val();
            const to = $("#to").val();

            if ((amount == '') || (isNaN(amount))) {
                $("#amtErr").html("Input a valid amount");
            }
            else {
                fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`)
                    .then(response => response.json())
                    .then(json_unit => {

                        const unit = json_unit[`${from}_${to}`];
                        const ans = unit * amount;
                        const rate = `1${from} = ${unit}${to}`;

                        if (!isNaN(ans)) { 
                            $("#answer").html(`${ans}`);
                            $("#rate").html(`${rate}`);
                        }
                    });
            }
        }

    }
});


const dbPromise = idb.open('currencyConverter', 3, (upgradeDb) => {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('countries', { keyPath: 'currencyId' });
        case 1:
            let countriesStore = upgradeDb.transaction.objectStore('countries');
            countriesStore.createIndex('country', 'currencyName');
            countriesStore.createIndex('country-code', 'currencyId');
        case 2:
            upgradeDb.createObjectStore('conversionRates', { keyPath: 'query' });
            let ratesStore = upgradeDb.transaction.objectStore('conversionRates');
            ratesStore.createIndex('rates', 'query');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    /*
     Fetch Countries Process
      */
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
        .then(res => res.json())
        .then(res => {
            Object.values(res.results).forEach(country => {
                dbPromise.then(db => {
                    const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                    countries.put(country);
                })
            });
            dbPromise.then(db => {
                const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })
            })
        }
        ).catch(() => {
            dbPromise.then(db => {
                const countries = db.transaction('countries').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })

            });
        });
});