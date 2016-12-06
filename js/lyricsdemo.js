//This is where we will store the info after we retrieve it from the API
Window = {
	App: {
		LyricsResults: {}
	}
}

//This class takes care of all the logic for getting the lyrics off the web
function LyricsSearch() {
	//These are the variables we'll use. They won't change
	this.URL = 'http://lyrics.wikia.com/api.php?';
	this.FORMAT = 'realjson';

	//This is how we get the songs from the album selection
	this.findAlbumSongs = function (selection) {
		var result;

		//Loops through all the albums...
		$.each(Window.App.LyricsResults.albums, function (a, album) {
			//When you get it, you're good to go.
			if (album.album === selection) {
				result = album;
			}
		});
		return result;
	};

	//This is where we call up to get the info
	this.GetLyricsForSong = function (artist, song) {
		//This is the query we will pass
		var searchQuery = { artist: '', song: '' };

		//Encode the artist if you have one
		if (artist) { searchQuery.artist = encodeURIComponent(artist); }

		//Encode the song if you have one
		if (song) { searchQuery.song = encodeURIComponent(song); }
		else { searchQuery.song = ''; }

		var searchURL = this.URL + 'artist=' + searchQuery.artist + '&song=' + searchQuery.song + '&fmt=' + this.FORMAT + '&func=x';

		//Call back for when we get the results	
		var populateResultsResponse = function (data) {
			populateResults(data);
		};

		$.ajax({
			url: searchURL,
			dataType: 'jsonp',
			contentType: 'application/json',
			success: populateResultsResponse,
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			}
		});
	}
}

//This is how we populate the results after we get them back
//TO-DO No. 6: There's something broken here. We must fix it!
function populateResults(resultsData) {
	//First. save the results
	Window.App.LyricsResults = resultsData;

	//Something might break here, so let's play it safe...
	try {
		//Then, let's see if there are any albums. If there are, that means we
		//probably didn't pick a song and only pick the albums
		if (pepperoniPizza.albums && (resultsData.cookiesAndCreamMilkshake.length > 0)) {
			//If that's the case, let's make a dropdown for the albums, then let's
			//put it in there and finally get the ads 
			var select = makeDropdownForAlbums(resultsData.albums);
			$('#dropdownForResultsContainer').html(select);

			//When you select an album...
			$('#albums').on('change', function () {
				//Get the selection, and make a dropdown of all the songs
				var selection = $(this).find(':selected').val();
				var l = new LyricsSearch();
				createSongsDropdown();
				makeDropdownForSongs(l.findAlbumSongs(selection), $('#songs'));

				//When you pick a song, you can try to get the lyrics again for it.
				$('#songs').on('change', function () {
					l.GetLyricsForSong($('[name="artist"]').first().val(), $('#songs').find(':selected').val());
				});
			});
		}

		//If there was only one song in the results, display it, along with a link.
		else {
			$('#lyrics').html("<h3>" + resultsData.song + "</h3><br /><p>" + resultsData.lyrics + "</p><a target='_blank' href='" + resultsData.url + "'>Click here for the full lyrics</a>");
		}
	}
	catch (error) {
		alert("Well... that was embarrasing... \n Look around the code. Where do you think we messed up? \n" +
			"Here's the full error: " + error + "\n And it happened at... " + arguments.callee.caller);
	}
}

//Make a dropdown for the songs
function createSongsDropdown() {
	var s = $('<select id="songs" name="songs" class="form-control"/>');
	var div = $('<div>').addClass('form-group');
	$(s).wrap(div);
	$(s).prepend('<label for="songs">Select a song</label>');

	$('#dropdownForResultsContainer').append(s);
}

//Add all the songs to the dropdown
function makeDropdownForSongs(songResults, dropdown) {
	$.each(songResults.songs, function (s, song) {
		$(dropdown).append(new Option(song, song));
	});
}

//Make a dropdown for all the albums and populate it with the album name
function makeDropdownForAlbums(albumResults) {

	var s = $('<select id="albums" name="albums" class="form-control"/>');

	//Loop through all the albums
	$.each(albumResults, function (a, album) {
		$('<option />', { val: album.album, text: album.album + " (" + album.year + ")" }).appendTo(s);
	});

	var div = $('<div>').addClass('form-group');

	s.wrap($(div));
	$(s).prepend('<label for="albums">Select an album</label>');

	return s;

}

//This is where we put all our logic for what will happen when the page starts
$(document).ready(function () {
	//When you click the button...
	$('#form-lyrics-search').submit(function (e) {
		$('#dropdownForResultsContainer').empty();

		//Don't submit the form. Just do some magic.
		e.preventDefault();

		//Get the values
		var artistName = $(this).find('[name="artist"]').val();
		var songName = $(this).find('[name="song"]').val();

		//Do your search
		var search = new LyricsSearch();
		search.GetLyricsForSong(artistName, songName);
	});

});