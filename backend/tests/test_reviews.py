import unittest, requests
from typing import Any

# from reviews import Review, app, db

url: str = "http://127.0.0.1:5000"

class TestReview(unittest.TestCase):
    '''
    Test class for review functionality.
    '''

    def setUp(self) -> None:
        '''
        Set up method for test cases.
        '''
        pass

    def test_0010_submit_review(self) -> None:
        '''
        Tests the submit review functionality.
        '''
        submit_url = url+"/submit_review"

        submit_request = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "Anonymous", "rating": 4.2, "message": "This was quite enjoyable"})
        self.assertEqual(submit_request.status_code, 201)

        submit_request_2 = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "Anonymous", "rating": 4.8, "message": "After reading this a second time, it was even better!"})
        self.assertEqual(submit_request_2.status_code, 400)

        submit_request_3 = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "User_1", "rating": 9.3, "message": "Absolutely amazing!!!"})
        self.assertEqual(submit_request_3.status_code, 400)

        submit_request_4 = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "bookhater23", "rating": "bad book", "message": "I hated everything about this book >:("})
        self.assertEqual(submit_request_4.status_code, 400)

        submit_request_5 = requests.post(submit_url, json={"book_id": "The Catcher in the Rye", "user": "Amazed_Unicorn", "rating": 4.5, "message": "I liked this book a lot."})
        self.assertEqual(submit_request_5.status_code, 404)

    def test_0020_update_review(self) -> None:
        '''
        Tests the update review functionality.
        '''
        submit_url = url+"/submit_review"
        submit_request = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "user5", "rating": 4.2, "message": "This was quite enjoyable"})
        
        review_id = submit_request.json().get("review_id")
        self.assertIsNotNone(review_id)

        update_url = f"{url}/update_review/{review_id}"

        update_request = requests.put(update_url, json={"rating": 2.8, "message":"The story has good potential but the execution was very mediocre."})
        self.assertEqual(update_request.status_code, 200)

        update_request_2 = requests.put(update_url, json={"rating":"11", "message": "I loved every single bit about this book, 11/10."})
        self.assertEqual(update_request_2.status_code, 400)

        update_request_3 = requests.put(update_url, json={"rating":"Great", "message": "Writer did a great job!"})
        self.assertEqual(update_request_3.status_code, 400)

    def test_0030_delete_review(self) -> None:
        '''
        Tests the delete review functionality.
        '''
        submit_url = url+"/submit_review"
        submit_request = requests.post(submit_url, json={"book_id": "abYKXvCwEToC", "user": "Anonymous", "rating": 4.2, "message": "This was quite enjoyable"})

        delete_url = url+"/delete_review"

        delete_request = requests.delete(delete_url, json={"user":"Anonymous", "book_id":"abYKXvCwEToC"})
        self.assertEqual(delete_request.status_code, 200)

        delete_request_2 = requests.delete(delete_url, json={"user":"TheOneAndOnly", "book_id":"abYKXvCwEToC"})
        self.assertEqual(delete_request_2.status_code, 404)


    def test_0040_sort_reviews(self) -> None:
        '''
        Tests the sort reviews functionality.
        '''
        get_request = requests.get(url+"/reviews_sorted")
        self.assertEqual(get_request.status_code, 200)

        rating_asc_url = requests.get(f"{url}/reviews_sorted?sort_by=rating&order=asc")
        self.assertEqual(rating_asc_url.status_code, 200)

        reviews = rating_asc_url.json()
        ratings = [r["rating"] for r in reviews]
        self.assertEqual(ratings, sorted(ratings))


        rating_desc_url = requests.get(f"{url}/reviews_sorted?sort_by=rating&order=desc")
        self.assertEqual(rating_desc_url.status_code, 200)

        reviews = rating_desc_url.json()
        ratings = [r["rating"] for r in reviews]
        self.assertEqual(ratings, sorted(ratings, reverse=True))


        date_asc_url = requests.get(f"{url}/reviews_sorted?sort_by=date&order=asc")
        self.assertEqual(date_asc_url.status_code, 200)

        reviews = date_asc_url.json()
        dates = [r["date"] for r in reviews]
        self.assertEqual(dates, sorted(dates))
        

        date_desc_url = requests.get(f"{url}/reviews_sorted?sort_by=date&order=desc")
        self.assertEqual(date_desc_url.status_code, 200)

        reviews = date_desc_url.json()
        dates = [r["date"] for r in reviews]
        self.assertEqual(dates, sorted(dates, reverse=True))


        response = requests.get(f"{url}/reviews_sorted?sort_by=genre&order=asc")
        self.assertEqual(response.status_code, 404)

        response = requests.get(f"{url}/reviews_sorted?sort_by=rating&order=mediocre_first")
        self.assertEqual(response.status_code, 404)
    

    def test_0050_get_reviews_by_book_id(self) -> None:
        '''
        Tests the get reviews by book ID functionality.
        '''
        submit_request = requests.post(url+"/submit_review", json={"book_id": "XjYQCwAAQBAJ", "user": "newuser", "rating": 4.2, "message": "This was quite enjoyable"})
        self.assertEqual(submit_request.status_code, 201)

        get_request = requests.get(url+"/reviews_book/XjYQCwAAQBAJ")
        self.assertEqual(get_request.status_code, 200)
        #checking everything separetly because we cannot test the date and time the review is placed.
        self.assertEqual(get_request.json()['reviews'][0]['book_id'], "XjYQCwAAQBAJ")
        self.assertEqual(get_request.json()['reviews'][0]['user'], "newuser")
        self.assertEqual(get_request.json()['reviews'][0]['rating'], 4.2)
        self.assertEqual(get_request.json()['reviews'][0]['message'], "This was quite enjoyable")


    def test_9999_cleanup(self) -> None:
        '''
        Cleanup method to remove test data.
        '''
        submit_request = requests.delete(url+"/delete_review", json={"book_id": "abYKXvCwEToC", "user": "user5"})
        self.assertEqual(submit_request.status_code, 200)

        submit_request2 = requests.delete(url+"/delete_review", json={"book_id": "XjYQCwAAQBAJ", "user": "newuser"})
        self.assertEqual(submit_request2.status_code, 200)

        