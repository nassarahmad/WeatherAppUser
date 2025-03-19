const container= document. querySelector('.container');
const document=document.querySelector (' .search-box button');
const weatherBox = document.querySelector(' .weather-box');
const weatherDetails = document.querySelector(' .weather-details');
const error404 = document.querySelector(' .not-found');
const cityHide = document.querySelector(' .city-hide');

search.addEventListener('click', () => {
const APIKey = '9af42213ce288a708c0720141f1be1cb' ;
const city = document.querySelector('.search-box input').value;
if(city == '') return;
return;

fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
.then (response => response. json ()).then (json => {
    if(json.cod == '404') {
        cityHide.textContent=city;
        container.style.height = '400px';
        weatherBox.classList.remove('active');
         weatherDetails.classList.remove('active');
          error404.classList.add('active');
        return;
    }
    
       
        
   const image = document.querySelector('.weather-box img');
    const temperature = document. querySelector('.weather-box .temperature');
    const description = document. querySelector('.weather-box .description');
    const humidity = document.querySelector ('.weather-details .humidity span');
    const wind = document. querySelector(' .weather-details .wind span');

if(cityHide.textContent==city){
    return;
}else{
cityHide.textContent=city
container.style.height = '555px';
container.classList.add('active');
weatherBox. classlist.add ('active');
 weatherDetails.classList.add('active');
  error404.classList.remove('active');
  setTimeout(()=>{
container.classList.remove('active');
  },2500)

  switch (json.weather[0].main) {
    case 'Clear':
        image.src='images/clear.png';
        break;
        case 'Rain':
            image.src='images/rain.png';
            break;
            case 'Snow':
                image.src='images/snow.png';
                break;
                case 'Clouds':
                    image.src='images/cloud.png';
                    break;
                    case 'Mist':
                        image.src='images/mist.png';
                        break;
                        case 'Haze':
                            image.src='images/mist.png';
                            break;
   
    default:
        image.src='images/cloud.png';

        
   }
}

   




});
})