$(function() {

  $('#instantSearch').keyup(function() {

    var search_term = $(this).val();

    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
	  
	  //if success
      success: function(json) {
        var data = json.hits.hits.map(function(hit) {
          return hit;
        });


        $('#instantSearchResults').empty();
        for (var i = 0; i < data.length; i++) {
          var html = "";
          html += '<div class="col-md-4">';
          html += '<a href="/product/' + data[i]._source._id + '">';
          html += '<div class="thumbnail">';
          html += '<img src="' +  data[i]._source.image + '">';
          html += '<div class="caption">';
          html += '<h3>' + data[i]._source.name  + '</h3>';
          html += '<p>' +  data[i]._source.ganre  + '</h3>'
          html += '<p>' +  data[i]._source.price  + '.din</p>';
          html += '</div></div></a></div>';

          $('#instantSearchResults').append(html);
        }

      },
		//if error
      error: function(error) {
        console.log(error);
      }
    });
  });

  
   $(document).on('click', '#plus', function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());

    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });

 $(document).on('click', '#minus', function(e) {
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());


    if (quantity == 1) {
      priceValue = $('#priceHidden').val();
      quantity = 1;
    } else {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;
    }

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });
  
  
/*https://stripe.com/docs/custom-form 
*/
//Step 1: Collecting credit card information
 Stripe.setPublishableKey('pk_test_CctGkxrVoGTREei00Gaklg58');
 
  
//Step 2: Create a single use token  
   $('#payment-form').submit(function(event) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });
  
  
//Step 3:Sending the form to your server
     function stripeResponseHandler(status, response) {
  var $form = $('#payment-form');

  if (response.error) {
    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else {
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    // and submit
    $form.get(0).submit();
  }
};


  //deletemovie
  $('.delete-movie').click(function(event){
		
		$target = $(event.target);
		$.ajax({
			type: 'DELETE',
			url: '/delete-movie/' +$target.attr('data-movie-id'),
		
			success: function(response){
				$target.parent().parent().remove();
				alert("movie removed");
				window.location.href= '/admin';
							
			},
			
			error: function(error){
				alert(error);
				console.log(error);
			}
			
			
		})
		
	});
	
  
  
  
  
  





})
