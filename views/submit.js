
		function getLocation() {
		  if (navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(showPosition);
		  } else {
		    x.innerHTML = "Geolocation is not supported by this browser.";
		  }
		}

		function showPosition(position) {
				getReverseGeocodingData(position.coords.latitude, position.coords.longitude);
		}

		function getReverseGeocodingData(lat, lng) {
			geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(lat, lng);
			    geocoder.geocode({'latLng': latlng}, function(results, status) {
			      if (status == google.maps.GeocoderStatus.OK) {
			      //console.log(results);
			        if (results[1]) {
			        var indice=0;
			        for (var j=0; j<results.length; j++)
			        {
			            if (results[j].types[0]=='locality')
			                {
			                    indice=j;
			                    break;
			                }
			            }
			        alert('The good number is: '+j);
			        console.log(results[indice]);
			        for (var i=0; i<results[indice].address_components.length; i++)
			            {
			                if (results[indice].address_components[i].types[0] == "locality") {
			                        //this is the object you are looking for City
			                        city = results[indice].address_components[i];
			                    }
			                if (results[indice].address_components[i].types[0] == "administrative_area_level_1") {
			                        //this is the object you are looking for State
			                        region = results[indice].address_components[i];
			                    }
			                if (results[indice].address_components[i].types[0] == "country") {
			                        //this is the object you are looking for
			                        country = results[indice].address_components[i];
			                    }
			            }

			            //city data
			            //alert(city.long_name + " || " + region.long_name + " || " + country.short_name)
									var userCity = document.getElementById("userCity");
									userCity.value = city.long_name;

									var userState = document.getElementById("userState");
									userState.value = region.long_name;

									var userCountry = document.getElementById("userCountry");
									userCountry.value = country.short_name;


			            } else {
			              alert("No results found");
			            }
			        //}
			      } else {
			        alert("Geocoder failed due to: " + status);
			      }
			    });
			  }
        
$(document).ready(function(){

	$( "#form2" ).submit(function(event) {
		event.preventDefault();

		$.ajax({
			type: 'POST',
			url: '/submitScore',
			data: $('#form2').serialize(),
			dataType: "json",
			success: function(response){
				//alert("a");
				//console.log(response.Success);
				$('#form2')[0].reset();

				document.getElementById("check").innerHTML=response.Success;
							//ADD THIS CODE
							setTimeout(function(){
								document.getElementById("check").innerHTML="";
							},3000);
							if (response.Success=="You are regestered,You can login now.") {
								document.getElementById("aa").click();
							};
						},
						error: function() {
							console.log("heck no");
						}
					})
	});
});
