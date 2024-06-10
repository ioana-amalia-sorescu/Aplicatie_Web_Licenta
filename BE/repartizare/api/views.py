from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from django.db import connection
import hashlib
import jwt
from django.conf import settings
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime
import math
secret_key = settings.SECRET_KEY


class Users(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        password = hashlib.sha256(password.encode()).hexdigest()

        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM users WHERE email='{email}' AND password='{password}'")

        if cursor.rowcount > 0:
            user = cursor.fetchone()
            jwt_payload = {
                'id': user[0],
            }
            jwt_token = jwt.encode(jwt_payload, 'secret_key', algorithm='HS256')

            response = {
                'loggedIn': True,
                'token': jwt_token
            }
        else:
            response = {
                'loggedIn': False
            }

        return Response(response)
    

class Rooms(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], url_path='getRooms')
    def getRooms(self, request):
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM rooms")

        rooms = cursor.fetchall()

        response = []

        for room in rooms:
            response.append({
                'id': room[0],
                'name': room[1],
                'seats': room[2],
                'form': room[3]
            })

        return Response(response)

    @action(detail=False, methods=['get'], url_path='getRoom')
    def getRoom(self, request):
        id = request.query_params.get('id')

        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM rooms WHERE id={id}")

        room = cursor.fetchone()

        response = {
            'id': room[0],
            'name': room[1],
            'seats': room[2],
            'form': room[3]
        }

        return Response(response)

class Students(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'], url_path='getStudents')
    def getStudents(self, request):

        series = request.data.get('series')
        groups = request.data.get('groups')

        groups = json.loads(groups)
        
        response = []

        cursor = connection.cursor()

        for gr in groups:
            cursor.execute(f"SELECT * FROM students WHERE series='{series}' AND gr='{gr}'")
            stds = []
            students = cursor.fetchall()

            for student in students:
                stds.append({
                    'id': student[0],
                    'firstName': student[1],
                    'lastName': student[2],
                    'series': student[3],
                    'gr': student[4],
                    'email': student[5]
                })

            grp = {
                'group': gr,
                'students': stds
            }

            response.append(grp)

        return Response(response)

    @action(detail=False, methods=['get'], url_path='getSeries')
    def getSeries(self, request):
        cursor = connection.cursor()
        cursor.execute(f"SELECT DISTINCT series FROM students")

        series = cursor.fetchall()

        response = []

        for serie in series:
            response.append(serie[0])

        return Response(response)
    
    @action(detail=False, methods=['get'], url_path='getGroups')
    def getGroups(self, request):
        series = request.query_params.get('series')

        cursor = connection.cursor()
        cursor.execute(f"SELECT DISTINCT gr FROM students WHERE series = '{series}'")

        groups = cursor.fetchall()

        response = []

        for group in groups:
            response.append(group[0])

        return Response(response)

class Reservations(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'], url_path='checkInterval')
    def checkInterval(self, request):
        room = request.data.get('room')
        start = request.data.get('start')
        end = request.data.get('end')

        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM reservations WHERE idroom={room} AND ((start_time<='{start}' AND end_time>='{start}') OR (start_time<='{end}' AND end_time>='{end}'))")

        if cursor.rowcount > 0:
            response = {
                'available': False
            }
        else:
            response = {
                'available': True
            }

        return Response(response)
    
    @action(detail=False, methods=['post'], url_path='scheduleExam')
    def scheduleExam(self, request):
        room = request.data.get('room')
        start = request.data.get('start')
        end = request.data.get('end')
        iduser = request.data.get('iduser')
        studs = request.data.get('studs')
        howToRepart = request.data.get('howToRepart')

        howToRepart = json.loads(howToRepart)

        howToRepart = list(zip(*howToRepart))

        howToRepart = [column for column in howToRepart if not all(x == -1 for x in column)]

        howToRepart = list(zip(*howToRepart))

        studs = json.loads(studs)
        studs_str = ', '.join(str(id) for id in studs)

        form = json.dumps(howToRepart)

        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM reservations WHERE idroom={room} AND ((start_time<='{start}' AND end_time>='{start}') OR (start_time<='{end}' AND end_time>='{end}'))")
        if cursor.rowcount > 0:
            return Response({'response': 'not available'})


        cursor.execute(f"INSERT INTO reservations (idroom, iduser, start_time, end_time, form) VALUES ({room}, {iduser}, '{start}', '{end}', '{form}')")

        cursor.execute(f"SELECT id, firstName, lastName, email FROM students WHERE id IN ({studs_str})")

        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        mails = cursor.fetchall()

        cursor.execute(f"SELECT name FROM rooms WHERE id={room}")

        room_name = cursor.fetchone()[0]

        cursor.execute(f"SELECT name, materie FROM users WHERE id={iduser}")
        
        rs = cursor.fetchone()
        user_name = rs[0]
        materie = rs[1]

        for mail in mails:
            student_email = mail[3]

            if student_email != 'X@domain':
                id = mail[0]
                message = MIMEMultipart()
                message['From'] = 'repartizare.no.reply@outlook.com'
                message['To'] = student_email
                message['Subject'] = 'Repartizare examen'

                seat_number = ''

                for row in howToRepart:
                    for seat in row:
                        if seat == id:
                            seat_number = letters[howToRepart.index(row)] + str(row.index(seat) + 1)

                start_datetime = datetime.datetime.fromtimestamp(start)
                start_date = start_datetime.strftime('%d-%m-%Y')
                start_hour = start_datetime.strftime('%H:%M')

                end_datetime = datetime.datetime.fromtimestamp(end)
                end_hour = end_datetime.strftime('%H:%M')

                seat_info = f'Bună ziua {mail[1]} {mail[2]}, \n\nVă informăm că examenul la {materie}, susținut sub îndrumarea profesorului {user_name} va avea loc în sala {room_name}.\nLocul alocat dumneavoastră este {seat_number}. Examenul va începe la data de {start_date}, ora {start_hour} și se va încheia la ora {end_hour} \n\nVă urăm mult succes!'

                message.attach(MIMEText(seat_info, 'plain'))

                with smtplib.SMTP('smtp.office365.com', 587) as session:
                    session.starttls()
                    session.login('repartizare.no.reply@outlook.com', 'Parola01*')
                    text = message.as_string()
                    session.sendmail('repartizare.no.reply@outlook.com', student_email, text)
                

        return Response({'response': 'done'})
    
    @action(detail=False, methods=['post'], url_path='scheduleExamAuto')
    def scheduleExamAuto(self, request):
        room = request.data.get('room')
        iduser = request.data.get('iduser')
        studs = request.data.get('studs')
        howToRepart = request.data.get('howToRepart')
        duration = request.data.get('duration')

        howToRepart = json.loads(howToRepart)

        howToRepart = list(zip(*howToRepart))

        howToRepart = [column for column in howToRepart if not all(x == -1 for x in column)]

        howToRepart = list(zip(*howToRepart))

        studs = json.loads(studs)
        studs_str = ', '.join(str(id) for id in studs)

        form = json.dumps(howToRepart)

        cursor = connection.cursor()

        now = math.floor(datetime.datetime.now().timestamp())
        now = now - now % 86400
        now = now + 86400

        cursor.execute(f"SELECT * FROM reservations WHERE idroom={room} AND end_time>{now} ORDER BY start_time ASC")
        reservations = cursor.fetchall()

        start = now
        ok = False

        if len(reservations) != 0:
            start_datetime = datetime.datetime.fromtimestamp(start)
            start_hour = start_datetime.hour
            start_minute = start_datetime.minute
            start_moment = start_hour * 3600 + start_minute * 60

            if start + duration < reservations[0][1] and start_moment >= 8 * 3600 and start_moment + duration <= 18 * 3600:
                ok = True

            if ok is False:
                for i in range(len(reservations) - 1):
                    start = reservations[i][2] + 1
                    start_datetime = datetime.datetime.fromtimestamp(start)
                    start_hour = start_datetime.hour
                    start_minute = start_datetime.minute
                    start_moment = start_hour * 3600 + start_minute * 60

                    if start + duration < reservations[i + 1][1] and start_moment >= 8 * 3600 and start_moment + duration <= 18 * 3600:
                        ok = True
                        break

            if ok is False:
                start = reservations[-1][2] + 1

                start_datetime = datetime.datetime.fromtimestamp(start)
                start_hour = start_datetime.hour
                start_minute = start_datetime.minute
                start_moment = start_hour * 3600 + start_minute * 60

                if start_moment + duration > 18 * 3600:
                    start_datetime = datetime.datetime.fromtimestamp(start)
                    start_datetime += datetime.timedelta(days=1)
                    start_datetime = start_datetime.replace(hour=8, minute=0, second=0)
                    start = math.floor(start_datetime.timestamp())
        else:
            start_datetime = datetime.datetime.fromtimestamp(start)
            start_datetime += datetime.timedelta(days=1)
            start_datetime = start_datetime.replace(hour=8, minute=0, second=0)
            start = math.floor(start_datetime.timestamp())

        end = start + duration

        cursor.execute(f"INSERT INTO reservations (idroom, iduser, start_time, end_time, form) VALUES ({room}, {iduser}, '{start}', '{end}', '{form}')")

        cursor.execute(f"SELECT id, firstName, lastName, email FROM students WHERE id IN ({studs_str})")

        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        mails = cursor.fetchall()

        cursor.execute(f"SELECT name FROM rooms WHERE id={room}")

        room_name = cursor.fetchone()[0]

        cursor.execute(f"SELECT name, materie FROM users WHERE id={iduser}")
        
        rs = cursor.fetchone()
        user_name = rs[0]
        materie = rs[1]

        for mail in mails:
            student_email = mail[3]

            if student_email != 'X@domain':
                id = mail[0]
                message = MIMEMultipart()
                message['From'] = 'repartizare.no.reply@outlook.com'
                message['To'] = student_email
                message['Subject'] = 'Repartizare examen'

                seat_number = ''

                for row in howToRepart:
                    for seat in row:
                        if seat == id:
                            seat_number = letters[howToRepart.index(row)] + str(row.index(seat) + 1)

                start_datetime = datetime.datetime.fromtimestamp(start)
                start_date = start_datetime.strftime('%d-%m-%Y')
                start_hour = start_datetime.strftime('%H:%M')

                end_datetime = datetime.datetime.fromtimestamp(end)
                end_hour = end_datetime.strftime('%H:%M')

                seat_info = f'Bună ziua {mail[1]} {mail[2]}, \n\nVă informăm că examenul la {materie}, susținut sub îndrumarea profesorului {user_name} va avea loc în sala {room_name}.\nLocul alocat dumneavoastră este {seat_number}. Examenul va începe la data de {start_date}, ora {start_hour} și se va încheia la ora {end_hour} \n\nVă urăm mult succes!'

                message.attach(MIMEText(seat_info, 'plain'))

                with smtplib.SMTP('smtp.office365.com', 587) as session:
                    session.starttls()
                    session.login('repartizare.no.reply@outlook.com', 'Parola01*')
                    text = message.as_string()
                    session.sendmail('repartizare.no.reply@outlook.com', student_email, text)
                

        return Response({'response': 'done', 'start': start}) 
        
    @action(detail=False, methods=['get'], url_path='getReservations')
    def getReservations(self, request):
        id = request.query_params.get('id')
        now = math.floor(datetime.datetime.now().timestamp())
        now = now - now % 86400

        cursor = connection.cursor()
        cursor.execute(f"SELECT start_time, end_time FROM reservations WHERE idroom={id} AND start_time>{now} ORDER BY start_time ASC")

        reservations = cursor.fetchall()

        response = []

        for reservation in reservations:
            response.append({
                'start': reservation[0],
                'end': reservation[1]
            })

        return Response(response)