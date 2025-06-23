from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import requests
from sqlalchemy.orm.attributes import flag_modified
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import requests
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import urlencode
# Run website --> python backend/app.py in cmd
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Start gemini API with system prompt for book recommendations
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat = client.chats.create(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(
        system_instruction="You are BookBuddy, a friendly and knowledgeable book recommendation assistant."
    )
)

basedir = os.path.abspath(os.path.dirname(__file__))
instance_dir = os.path.join(basedir, "instance")
os.makedirs(instance_dir, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_dir, "bookbuddy.db")}'

db = SQLAlchemy(app)

class Favorite(db.Model):
    '''
    Favorite model, to store list of book id's and the user the favorites belong to.
    '''
    user = db.Column(db.String(100), primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self) -> Dict[str, Any]:
        '''
        Converts the Favorite object to a dictionary representation.
        Returns: a dict, containing user and book_list_id
        '''
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class ReadBooks(db.Model):
    '''
    Read books model, stores list of book id's and the user the read books belong to.
    '''
    user = db.Column(db.String(100), primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self) -> Dict[str, Any]:
        '''
        Converts the ReadBooks object to a dictionary representation.
        Returns: a dict, containing user and book_list_id
        '''
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class WantToRead(db.Model):
    '''
    Want to read books model, stores list of book id's and the user the want to read books belong to.
    '''
    user = db.Column(db.String(100), primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self) -> Dict[str, Any]:
        '''
        Converts the WantToRead object to a dictionary representation.
        Returns: a dict, containing user and book_list_id
        '''
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class Review(db.Model):
    '''
    Review model, stores book reviews with user ratings and messages.
    '''
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(15), nullable=False)
    user = db.Column(db.String(30), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    message = db.Column(db.Text)

def search_url_build(query: str, order_by: Optional[str] = None, lg: Optional[str] = None, start_index: int = 0, max_results: int = 10, api_key: Optional[str] = None) -> str:
    '''
    Builds a search URL for the Google Books API with the given parameters.
    Returns: a str, the complete search URL
    '''
    base_link = "https://www.googleapis.com/books/v1/volumes"
    params = {
        "q": f"intitle:{query}",
        "startIndex": start_index,
        "maxResults": max_results
    }

    if order_by:
        params["orderBy"] = order_by
    if lg:
        params["langRestrict"] = lg
    if api_key:
        params["key"] = api_key

    # add all of the parameters to the url for the search.
    query_string = urlencode(params)
    full_url = f"{base_link}?{query_string}"
    print(query_string, full_url)
    #returns full url with all the search parameters.
    return full_url



with app.app_context():
    db.create_all()


@app.route("/")
def home() -> Any:
    '''
    Home route that returns a welcome message.
    Returns: a json response with welcome message
    '''
    return jsonify({"message": "Welcome to BookBuddy"})


#region favorite app routes
@app.route("/favorites", methods=["GET"])
def get_favorites() -> Any:
    '''
    Returns all favorites stored in the database.
    The return is a list of book id's
    '''
    favorites = Favorite.query.all()
    return jsonify({"favorites": [favorite.to_dict() for favorite in favorites]})


@app.route("/favorites/<string:user_id>", methods=["GET"])
def get_favorite(user_id: str) -> Any:
    '''
    Returns users favorites according to user id.
    The return is a list of book id's
    '''
    favorite = Favorite.query.get(user_id)
    
    if favorite:
        return jsonify(favorite.to_dict())
    else:
        return jsonify({"error": f"favorite not found for user: {user_id}"}), 404

@app.route("/favorite_books/<string:user_id>", methods=["GET"])
def get_favorite_books(user_id: str) -> Any:
    '''
    Returns users favorite books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
    favorite = Favorite.query.get(user_id)
    
    if favorite:
        favorite_list = favorite.to_dict()['book_list_id']['list']
        book_list = []
        for fav in favorite_list:
            book = get_book_by_id(fav)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"favorite not found for user: {user_id}"}), 404

@app.route("/favorites", methods=["POST"])
def post_favorites() -> Any:
    '''
    Creates favorites for user. 
    The data from the post request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()
    
    new_favorite = Favorite(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.to_dict()), 201

@app.route("/favorites/<string:user_id>", methods=["PUT"])
def update_favorites(user_id: str) -> Any:
    '''
    Updates favorites for user.
    The data from the put request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()

    favorite = Favorite.query.get(user_id)
    if favorite:
        favorite.user = data.get('user', favorite.user)
        favorite.book_list_id = data.get('book_list_id', favorite.book_list_id)

        db.session.commit()
        return jsonify(favorite.to_dict())
    else:
        return jsonify({"error": "favorite not found"}), 404


@app.route("/favorites/<string:user_id>", methods=["DELETE"])
def delete_favorites(user_id: str) -> Any:
    '''
    Deletes the favorites of user with user_id.
    '''
    favorite = Favorite.query.get(user_id)
    if favorite:
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "favorite was deleted"})
    else:
        return jsonify({"error": "favorite not found"}), 404
    
@app.route("/favorites/<string:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_favorites(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request.
    '''

    favorite = Favorite.query.get(user_id)
    if favorite:
        if book_id not in favorite.book_list_id['list']:
            favorite.book_list_id['list'].append(book_id)
            flag_modified(favorite, 'book_list_id')
            db.session.commit()
        return jsonify({'success': True, 'data': favorite.to_dict()})
    else:
        # Create new favorite list for user
        new_favorite = Favorite(user=user_id, book_list_id={'list': [book_id]})
        db.session.add(new_favorite)
        db.session.commit()
        return jsonify({'success': True, 'data': new_favorite.to_dict()}), 201


@app.route("/favorites/<string:user_id>/delete/<string:book_id>", methods=["POST"])
def delete_book_id_to_favorites(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    favorite = Favorite.query.get(user_id)
    if favorite:
        favorite.book_list_id['list'].remove(book_id)

        flag_modified(favorite, 'book_list_id')
        db.session.commit()
        return jsonify({'created': favorite.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404


    
#endregion


#region read book app routes
@app.route("/read_books", methods=["GET"])
def get_read_books() -> Any:
    '''
    Returns all read books stored in the database.
    The return is a list of book id's
    '''
    read_books = ReadBooks.query.all()
    return jsonify({"read books": [read_book.to_dict() for read_book in read_books]})


@app.route("/read_books/<string:user_id>", methods=["GET"])
def get_read_book(user_id: str) -> Any:
    '''
    Returns users read books according to user id.
    The return is a list of book id's
    '''
    read_books = ReadBooks.query.get(user_id)
    
    if read_books:
        return jsonify(read_books.to_dict())
    else:
        return jsonify({"error": f"read_book not found for user: {user_id}"}), 404

@app.route("/read_book_objects/<string:user_id>", methods=["GET"])
def get_read_book_object(user_id: str) -> Any:
    '''
    Returns users read books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
    read_books = ReadBooks.query.get(user_id)
    
    if read_books:
        read_book_list = read_books.to_dict()['book_list_id']['list']
        book_list = []
        for read in read_book_list:
            book = get_book_by_id(read)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"read_book not found for user: {user_id}"}), 404

@app.route("/read_books", methods=["POST"])
def post_read_books() -> Any:
    '''
    Creates read books for user. 
    The data from the post request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()
    
    new_read_book = ReadBooks(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_read_book)
    db.session.commit()

    return jsonify(new_read_book.to_dict()), 201

@app.route("/read_books/<string:user_id>", methods=["PUT"])
def update_read_books(user_id: str) -> Any:
    '''
    Updates read books for user.
    The data from the put request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()

    read_book = ReadBooks.query.get(user_id)
    if read_book:
        read_book.user = data.get('user', read_book.user)
        read_book.book_list_id = data.get('book_list_id', read_book.book_list_id)

        db.session.commit()
        return jsonify(read_book.to_dict())
    else:
        return jsonify({"error": "read_book not found"}), 404


@app.route("/read_books/<string:user_id>", methods=["DELETE"])
def delete_read_books(user_id: str) -> Any:
    '''
    Deletes the read books of user with user_id.
    '''
    read_book = ReadBooks.query.get(user_id)
    if read_book:
        db.session.delete(read_book)
        db.session.commit()

        return jsonify({"message": "read_book was deleted"})
    else:
        return jsonify({"error": "read_book not found"}), 404


@app.route("/read_books/<string:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_read_books(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    read_book = ReadBooks.query.get(user_id)
    if read_book:
        if book_id not in read_book.book_list_id['list']:
            read_book.book_list_id['list'].append(book_id)
            flag_modified(read_book, 'book_list_id')
            db.session.commit()
        return jsonify({'success': True, 'data': read_book.to_dict()})
    else:
        # Create new read books list for user
        new_read_book = ReadBooks(user=user_id, book_list_id={'list': [book_id]})
        db.session.add(new_read_book)
        db.session.commit()
        return jsonify({'success': True, 'data': new_read_book.to_dict()}), 201


@app.route("/read_books/<string:user_id>/delete/<string:book_id>", methods=["POST"])
def delete_book_id_to_read_books(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    read_book = ReadBooks.query.get(user_id)
    if read_book:
        read_book.book_list_id['list'].remove(book_id)

        flag_modified(read_book, 'book_list_id')
        db.session.commit()
        return jsonify({'created': read_book.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404



#endregion


#region want to read app routes
@app.route("/want_to_reads", methods=["GET"])
def get_want_to_reads() -> Any:
    '''
    Returns all want to read books stored in the database.
    The return is a list of book id's
    '''
    want_to_reads = WantToRead.query.all()
    return jsonify({"want to read books": [want_to_read.to_dict() for want_to_read in want_to_reads]})


@app.route("/want_to_reads/<string:user_id>", methods=["GET"])
def get_want_to_read(user_id: str) -> Any:
    '''
    Returns users want to read books according to user id.
    The return is a list of book id's
    '''
    want_to_reads = WantToRead.query.get(user_id)
    
    if want_to_reads:
        return jsonify(want_to_reads.to_dict())
    else:
        return jsonify({"error": f"want_to_read not found for user: {user_id}"}), 404

@app.route("/want_to_read_books/<string:user_id>", methods=["GET"])
def get_want_to_read_books(user_id: str) -> Any:
    '''
    Returns users want to read books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
    want_to_reads = WantToRead.query.get(user_id)
    
    if want_to_reads:
        want_to_read_list = want_to_reads.to_dict()['book_list_id']['list']
        book_list = []
        for read in want_to_read_list:
            book = get_book_by_id(read)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"want_to_read not found for user: {user_id}"}), 404

@app.route("/want_to_reads", methods=["POST"])
def post_want_to_read_books() -> Any:
    '''
    Creates want to read books for user. 
    The data from the post request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()
    
    new_want_to_read = WantToRead(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_want_to_read)
    db.session.commit()

    return jsonify(new_want_to_read.to_dict()), 201

@app.route("/want_to_reads/<string:user_id>", methods=["PUT"])
def update_want_to_read(user_id: str) -> Any:
    '''
    Updates want to read books for user.
    The data from the put request should hold the user id and the list of book id's.
    request body:
    {
        "user": user_id,
        "book_list_id": {
            "list": [
            "book id 1",
            "book id 2"
            ]
        }
    }
    '''
    data = request.get_json()

    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        want_to_read.user = data.get('user', want_to_read.user)
        want_to_read.book_list_id = data.get('book_list_id', want_to_read.book_list_id)

        db.session.commit()
        return jsonify(want_to_read.to_dict())
    else:
        return jsonify({"error": "want_to_reads not found"}), 404


@app.route("/want_to_reads/<string:user_id>", methods=["DELETE"])
def delete_want_to_read(user_id: str) -> Any:
    '''
    Deletes the want to read books of user with user_id.
    '''
    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        db.session.delete(want_to_read)
        db.session.commit()

        return jsonify({"message": "want_to_read was deleted"})
    else:
        return jsonify({"error": "want_to_read not found"}), 404
    

@app.route("/want_to_reads/<string:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_want_to_read(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        if book_id not in want_to_read.book_list_id['list']:
            want_to_read.book_list_id['list'].append(book_id)
            flag_modified(want_to_read, 'book_list_id')
            db.session.commit()
        return jsonify({'success': True, 'data': want_to_read.to_dict()})
    else:
        # Create new want to read list for user
        new_want_to_read = WantToRead(user=user_id, book_list_id={'list': [book_id]})
        db.session.add(new_want_to_read)
        db.session.commit()
        return jsonify({'success': True, 'data': new_want_to_read.to_dict()}), 201


@app.route("/want_to_reads/<string:user_id>/delete/<string:book_id>", methods=["POST"])
def delete_book_id_to_want_to_read(user_id: str, book_id: str) -> Any:
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        want_to_read.book_list_id['list'].remove(book_id)

        flag_modified(want_to_read, 'book_list_id')
        db.session.commit()
        return jsonify({'created': want_to_read.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404


#endregion


@app.route("/get_book/<string:book_id>", methods=["GET"])
def get_book_by_id(book_id: str) -> Any:
    '''
    Returns a book object from the given book_id the same as the Google Books API.
    '''
    book_request = requests.get(f"https://www.googleapis.com/books/v1/volumes/{book_id}")
    return book_request.json()

@app.route("/recommendations/<string:user_id>", methods=["GET"])
def get_recommendations(user_id: str) -> Any:
    '''
    Gets recommmendations for user. If user does not exist it will still return recommendations.
    '''
    favorite_book_ids = Favorite.query.get(user_id)

    # if the user does not exist or does not have favorite books
    if not favorite_book_ids:
        standard_genre: str = "Fiction"
        get_recommended_books = requests.get(f'https://www.googleapis.com/books/v1/volumes?q=subject:"{standard_genre}"&printType=books&projection=full')

        return jsonify({"recommendations": get_recommended_books.json(), "genre": "Fiction"})

    favorites: list = []
    genre_ranking: dict = {}

    for book_id in favorite_book_ids.book_list_id['list']:
        book = get_book_by_id(book_id)
        favorites.append(book)

        # check if book has categories
        if "volumeInfo" in book and "categories" in book["volumeInfo"]:
            genres = book["volumeInfo"]["categories"]
            genres_per_book: list = []
            # we only want to get one of each genre per book.
            for genre in genres:
                book_genre_list = genre.split('/')
                for book_genre in book_genre_list:
                    book_genre = book_genre.strip()

                    if book_genre not in genres_per_book:
                        genres_per_book.append(book_genre)
                        genre_ranking[book_genre] = genre_ranking.get(book_genre, 0) + 1

    # we want to grab the most common genre.
    most_common_genre: str = "Fiction"  # Default fallback
    highest_genre_count: int = 0
    for genre, count in genre_ranking.items():
        if count > highest_genre_count and genre != "General": #exclude general genre
            highest_genre_count = count
            most_common_genre = genre

    # search books by genre:
    get_recommended_books = requests.get(f'https://www.googleapis.com/books/v1/volumes?q=subject:"{most_common_genre}"&printType=books&projection=full')

    return jsonify({"recommendations": get_recommended_books.json(), "genre": most_common_genre})


@app.route("/most_favorites", methods=["GET"])
def get_most_favorites() -> Any:
    '''
    Returns a list of maximum 10 most favorite books according to the amount of favorites it has.
    '''

    favorites = Favorite.query.all()
    

    favorites_ranking: dict = {}

    for favorite in favorites:
        book_ids = favorite.book_list_id['list']

        for book_id in book_ids:
            favorites_ranking[book_id] = favorites_ranking.get(book_id, 0) + 1

    # sorts the list based on the values, high to low.
    favorites_sorted =  dict(sorted(favorites_ranking.items(), key=lambda x:x[1], reverse=True))
    top_favorites = list(favorites_sorted.keys())
    print(top_favorites)

    return jsonify({"most_favorites": top_favorites})


#search region
@app.route('/search', methods=['GET'])
def search() -> Any:
    '''
    This is the search endpoint for the google books api.
    It will return a list of books based on the query.
    '''
    query = request.args.get('q')
    order_by = request.args.get('order_by')
    lg = request.args.get('lang')
    page = int(request.args.get('page', 1))
    max_results = 10
    start_index = (page - 1) * max_results

    url = search_url_build(
        query=query,
        order_by=order_by,
        lg=lg,
        start_index=start_index,
        max_results=max_results,
        api_key= os.environ["API_KEY"]
    )

    response = requests.get(url)
    books = response.json().get("items", [])
    return jsonify(books)


@app.route("/api/chat", methods=["POST"])
def chat_endpoint() -> Any:
    '''
    This is the chat endpoint for the gemini api.
    It will return a response from the gemini api.
    '''
    try:
        data = request.get_json()
        if not data or "message" not in data or "user_id" not in data:
            return jsonify({"error": "No message or user_id provided"}), 400

        user_message = data["message"]
        user_id = data["user_id"]
        
        # Build system prompt with role definition
        system_prompt = "You are BookBuddy, a helpful book recommendation assistant. You help users discover new books based on their reading preferences and answer questions about books and reading.\n\n"
        
        # Get user's book context
        user_context = "User's reading profile:\n"
        has_reading_data = False
        
        # Get favorites
        favorites = Favorite.query.get(user_id)
        if favorites:
            favorite_books = []
            for book_id in favorites.book_list_id.get('list', []):
                book_info = get_book_by_id(book_id)
                if 'volumeInfo' in book_info:
                    favorite_books.append(book_info['volumeInfo'].get('title', 'Unknown Title'))
            if favorite_books:
                user_context += f"- Favorite books: {', '.join(favorite_books)}\n"
                has_reading_data = True
        
        # Get read books
        read = ReadBooks.query.get(user_id)
        if read:
            read_books = []
            for book_id in read.book_list_id.get('list', []):
                book_info = get_book_by_id(book_id)
                if 'volumeInfo' in book_info:
                    read_books.append(book_info['volumeInfo'].get('title', 'Unknown Title'))
            if read_books:
                user_context += f"- Books they've read: {', '.join(read_books)}\n"
                has_reading_data = True
        
        # Get want to read books
        want_to_read = WantToRead.query.get(user_id)
        if want_to_read:
            want_to_read_books = []
            for book_id in want_to_read.book_list_id.get('list', []):
                book_info = get_book_by_id(book_id)
                if 'volumeInfo' in book_info:
                    want_to_read_books.append(book_info['volumeInfo'].get('title', 'Unknown Title'))
            if want_to_read_books:
                user_context += f"- Books they want to read: {', '.join(want_to_read_books)}\n"
                has_reading_data = True
        
        if not has_reading_data:
            user_context += "- No reading history available yet\n"
        
        # Combine everything for the AI
        full_message = f"{system_prompt}{user_context}\nUser's question: {user_message}\n\nPlease provide a helpful response as BookBuddy."
        
        # Send message to gemini and get response
        response = chat.send_message(full_message)
        
        return jsonify({
            "response": response.text,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

def book_search_title(query: str) -> List[Dict[str, Any]]:
    '''
    Searches for books by title using the Google Books API and returns a list of matching book items.
    '''
    spliced = query.lower().split()
    spliced = "+".join(spliced)
    resonse = requests.request("GET",f"https://www.googleapis.com/books/v1/volumes?q=intitle:{spliced}&orderBY=relevance&key={os.environ["API_KEY"]}" )
    return resonse.json()["items"]

@app.route("/submit_review", methods=["POST"])
def submit_review() -> Any:
    '''
    Lets the user submit a review about a book they've written.
    '''
    data = request.get_json()

    book_id = data.get("book_id")
    user = data.get("user")
    rating = data.get("rating")
    message = data.get("message")

    try:
        rating = float(rating)
    except (TypeError, ValueError):
            return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
           
    if 0.0 > rating or rating > 5.0:
        return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
    
    book = get_book_by_id(book_id)
    if "error" in book or book.get("kind") != "books#volume":
        return jsonify({"Error":"Book was not found, please pick an existing book within our library."}), 404
    
    review_exists = Review.query.filter_by(user=user, book_id=book_id).first()
    if review_exists:
        return jsonify({"Error":"Review has already been submitted. Please delete your old review before posting a new one or edit your current review."}), 400
    
    new_review = Review(book_id=book_id, user=user, rating=rating, message=message)
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"Message":"Review was submitted successfully!", "review_id": new_review.id}), 201

@app.route("/update_review/<int:review_id>", methods=["PUT"])
def update_review(review_id: int) -> Any:
    '''
    Lets the user update one of their existing reviews.
    '''
    data = request.get_json()

    updated_rating = data.get("rating")
    updated_message = data.get("message")

    try:
        updated_rating = float(updated_rating)
    except (TypeError, ValueError):
            return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
           
    if 0.0 > updated_rating or updated_rating > 5.0:
        return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
    
    old_review = Review.query.get(review_id)
    if not old_review:
        return jsonify({"Error":"Review was not found."}), 404
    
    old_review.rating = updated_rating
    old_review.message = updated_message
    db.session.commit()

    return jsonify({"Message":"Review was updated successfully!"}), 200    

@app.route("/delete_review", methods=["DELETE"])
def delete_review_by_user() -> Any:
    '''
    Lets the user delete one of their existing reviews.
    '''
    data = request.get_json()

    user = data.get("user")
    book_id = data.get("book_id")

    review = Review.query.filter_by(user=user, book_id=book_id).first()

    if not review:
        return jsonify({"Error":"Review was not found."}), 404
    
    db.session.delete(review)
    db.session.commit()

    return jsonify({"Message":"Review has been deleted successfully!"}), 200

@app.route("/reviews_sorted", methods=["GET"])
def get_sorted_reviews() -> Any:
    '''
    Lets the user sort reviews of a book by their rating or date in either
    an ascending or descending order.
    '''
    sort_by = request.args.get("sort_by", "rating")
    order = request.args.get("order", "asc")

    if sort_by == "rating":
        category_order = Review.rating 
    elif sort_by == "date":
        category_order = Review.date
    else:
        return jsonify({"Error":"Order Category not found."}), 404
    
    if order == "asc":
        type_order = category_order.asc()
    elif order == "desc":
        type_order = category_order.desc()
    else:
        return jsonify({"Error":"Order Type not found."}), 404
    
    reviews = Review.query.order_by(type_order).all()

    return jsonify([{"user": review.user, "rating":review.rating, "message":review.message, "date":review.date.isoformat()} for review in reviews]) 


@app.route("/reviews_book/<string:book_id>", methods=["GET"])
def get_reviews_by_book_id(book_id: str) -> Any:
    '''
    Gets all reviews related to the book with book_id
    '''

    all_reviews = Review.query.all()

    reviews_with_book_id: list = []
    for review in all_reviews:
        if review.book_id == book_id:
            reviews_with_book_id.append({"user": review.user, "rating": review.rating, "message": review.message, "date": review.date, "book_id": review.book_id})

    if reviews_with_book_id:
        return jsonify({"reviews": reviews_with_book_id})
    else:
        return jsonify({"reviews": None})


if __name__ == "__main__":
    app.run(debug=True)

