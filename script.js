let formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = document.querySelector('.input__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
    dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    cheapestTicket =  document.getElementById('cheapest-ticket'),
    otherCheapTickets =  document.getElementById('other-cheap-tickets');

    let city = [];



const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = 'cca80f652a724a57cd41e3ab1e20395c',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 10;


//'dataBase/cities.json'


const getData = (url, callback) => {
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            callback(request.response);
        } else {
            console.error(request.status);
        }
    });
    request.send()

};


const showCity = (input, list) => {
    list.textContent = '';
    if (input.value !== '') {
        let filterCity = city.filter((item) => {
            if (item.name) {
                let fixItem = item.name.toLocaleLowerCase();
                return fixItem.startsWith(input.value.toLocaleLowerCase());
            }
        });

        filterCity.forEach((item) => {
            let li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            list.append(li);
        });
    };
};


const handlerCity = (e, input, list) => {
    let target = e.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};

const getNameCity = (code)=>{
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
    
}

const getDate = (date) =>{
    
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })




} 

const getChanges=(num)=>{
    if(num){
        return num === 1 ? 'C одной пересадкой' : 'С двумя пересадками'

    }
    else{
        return 'Без пересадок';
    }


}


    const getLinkAviaSales=(data)=>{
        let link = 'https://www.aviasales.ru/search/'

       link+=data.origin;

       const date = new Date(data.depart_date);

       const day =  date.getDate();
       const month =  date.getMonth()+1;

       link+=day < 10 ? '0' + day : day;

       link+=month < 10 ? '0' + month : month;
       link+=data.destination;

       link+='1';
       console.log(link);        
        return link
    };

const createCard = (data)=>{
    const ticket =  document.createElement('article');
    ticket.classList.add('ticket');
    let deep = '';
    if(data){
        deep = `
        <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
	<div class="left-side">
		<a href="${getLinkAviaSales(data)}" target="_blank" class="button button__buy">Купить
			за ${data.value}₽</a>
	</div>
	<div class="right-side">
		<div class="block-left">
			<div class="city__from">Вылет из города
				<span class="city__name">${getNameCity(data.origin)}</span>
			</div>
			<div class="date">${getDate(data.depart_date)}</div>
		</div>

		<div class="block-right">
			<div class="changes">${getChanges(data.number_of_changes)}</div>
			<div class="city__to">Город назначения:
				<span class="city__name">${getNameCity(data.destination)}</span>
			</div>
		</div>
	</div>
    </div>`;
        
    }

    else{
        deep = `<h3>Билетов на текущую дату не нашлось!<h3>`;
    }





    ticket.insertAdjacentHTML('afterbegin',deep)
    return ticket;

}

const renderCheapDay = (cheapTicket)=>{
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);

    console.log(ticket);

};
const renderCheapYear = (cheapTickets)=>{

    cheapTickets.sort((a, b)=>{
        if(a.value > b.value){
            return 1;
        }
        if(a.value < b.value){
            return -1;
        }
        return 0;
    });

    for(let i=0; i<cheapTickets.length && i<MAX_COUNT; i++){
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);

    }


    console.log(cheapTickets)

};
const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;
    
    let cheapTicketDay = cheapTicketYear.filter((item)=>{
       return item.depart_date === date;
    });


    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
};


inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (e) => {
    handlerCity(e, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (e) => {
    handlerCity(e, inputCitiesTo, dropdownCitiesTo);
});


formSearch.addEventListener('submit', (e) => {
    e.preventDefault();

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
    const cityTo = city.find((item) => inputCitiesTo.value === item.name);

    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value,
    
    };

    if (formData.from && formData.to) {
        const requestData = '?depart_date=' + formData.when +
        '&origin=' + formData.from.code + '&destination=' + formData.to.code + '&one_way=true&token=' + API_KEY;
        console.log(requestData);

        getData(calendar + requestData, (response) => {
            renderCheap(response, formData.when);

        });

    }

    else{
        alert("Введите коректное название города");
    }

   

});


getData(proxy + citiesApi, (data) => {
    city = JSON.parse(data);
    city.sort((a, b)=>{
        if(a.name > b.name){
            return 1;
        }
        if(a.name < b.name){
            return -1;
        }
        return 0;
    });

    console.log(city);

});