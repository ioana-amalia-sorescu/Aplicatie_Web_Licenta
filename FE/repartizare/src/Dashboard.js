import React from 'react';
import { root } from '.';

export class Dashboard {
    static DashboardContent = () => {
        return (
            <div className="page">
                <div className='row' style={{ marginTop: '3rem' }}>
                    <span style={{ fontSize: '1.5rem', color: 'var(--color)' }}>Alege sala:</span>
                    <select onChange={function (event) {
                        Dashboard.displayRoom(event);
                        Dashboard.displayInfo(event);
                    }} id="room">
                        <option value='N/A'>Alege sala</option>
                    </select>
                </div>

                <div>
                    <div className='room'></div>
                </div>
                <div className="room-info" style={{ marginBottom: '3rem' }}>

                </div>

            </div>
        );
    };

    static async dashboard() {
        root.render(<Dashboard.DashboardContent />);

        var response = await fetch('http://localhost:8000/api/rooms/getRooms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        var data = await response.json();

        var room = document.querySelector('#room');

        data.forEach((r) => {
            var option = document.createElement('option');
            option.value = r.id;
            option.innerHTML = r.name;
            room.appendChild(option);
        });
    }

    static async displayRoom(e) {
        var id = e.target.value;
        var room = document.querySelector('.room');

        if (id == 'N/A') {
            return;
        }

        var response = await fetch(`http://localhost:8000/api/rooms/getRoom?id=` + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        var data = await response.json();

        room.innerHTML = '';

        data = data.form;

        data = JSON.parse(data);

        data.forEach((r) => {
            var row = document.createElement('div');
            row.className = 'row';
            room.appendChild(row);

            r.forEach((c) => {
                var chair = document.createElement('div');
                if (c == -1)
                    chair.className = 'invisible-chair';

                else
                    chair.className = 'chair';
                row.appendChild(chair);
            });

        });
    }

    static async displayInfo(e) {
        var id = e.target.value;

        var roomInfo = document.querySelector('.room-info');

        if (id == 'N/A') {
            return;
        }

        var response = await fetch(`http://localhost:8000/api/rooms/getRoom?id=` + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        var data = await response.json();

        roomInfo.innerHTML = '';

        var col = document.createElement('div');
        col.className = 'column';
        col.style.justifyContent = 'space-between';
        roomInfo.appendChild(col);

        var span = document.createElement('span');
        span.innerHTML = 'Detalii sala';
        span.style.fontWeight = 'bold';
        span.style.color = 'var(--color)';
        span.style.fontSize = '1.5rem';
        col.appendChild(span);

        var row = document.createElement('div');
        row.className = 'row';
        col.appendChild(row);

        var span = document.createElement('span');
        span.innerHTML = 'Nume: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        span = document.createElement('span');
        span.innerHTML = data.name;
        span.style.color = 'var(--color)';
        span.style.fontSize = '1.15rem';
        span.style.marginLeft = '1rem';
        span.style.fontWeight = 'bold';
        row.appendChild(span);

        row = document.createElement('div');
        row.className = 'row';
        col.appendChild(row);

        span = document.createElement('span');
        span.innerHTML = 'Locuri: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        span = document.createElement('span');
        span.innerHTML = data.seats;
        span.style.color = 'var(--color)';
        span.style.fontSize = '1.15rem';
        span.style.marginLeft = '1rem';
        span.style.fontWeight = 'bold';
        row.appendChild(span);

        var row = document.createElement('div');
        row.className = 'row';
        col.appendChild(row);

        var col = document.createElement('div');
        col.className = 'column';
        col.style.marginLeft = '2rem';
        col.style.justifyContent = 'space-between';
        roomInfo.appendChild(col);

        var span = document.createElement('span');
        span.innerHTML = 'Detalii repartizare';
        span.style.fontWeight = 'bold';
        span.style.color = 'var(--color)';
        span.style.fontSize = '1.5rem';
        col.appendChild(span);

        var row = document.createElement('div');
        row.className = 'row';
        row.style.marginTop = '1rem';
        row.style.width = '100%';
        row.style.justifyContent = 'space-between';
        col.appendChild(row);

        var span = document.createElement('span');
        span.innerHTML = 'Studenti: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'students';
        input.style.color = 'var(--color)';
        input.style.fontSize = '1.15rem';
        input.style.marginLeft = '1rem';
        input.style.fontWeight = 'bold';
        row.appendChild(input);

        row = document.createElement('div');
        row.className = 'row';
        row.style.marginTop = '1rem';
        row.style.width = '100%';
        row.style.justifyContent = 'space-between';
        col.appendChild(row);

        var span = document.createElement('span');
        span.innerHTML = 'Locuri libere: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'freeSeats';
        input.style.color = 'var(--color)';
        input.style.fontSize = '1.15rem';
        input.style.marginLeft = '1rem';
        input.style.fontWeight = 'bold';
        row.appendChild(input);

        var row = document.createElement('div');
        row.className = 'row';
        row.style.marginTop = '1rem';
        row.style.width = '100%';
        row.style.justifyContent = 'space-between';
        col.appendChild(row);

        var span = document.createElement('span');
        span.innerHTML = 'Data start: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        var input = document.createElement('input');
        input.type = 'datetime-local';
        input.id = 'startDate';
        input.style.color = 'var(--color)';
        input.style.fontSize = '1.15rem';
        input.style.marginLeft = '1rem';
        input.style.fontWeight = 'bold';
        row.appendChild(input);

        var row = document.createElement('div');
        row.className = 'row';
        row.style.marginTop = '1rem';
        row.style.width = '100%';
        row.style.justifyContent = 'space-between';
        col.appendChild(row);

        var span = document.createElement('span');
        span.innerHTML = 'Data final: ';
        span.style.fontWeight = 'bold';
        span.style.color = 'gray';
        span.style.fontSize = '1.15rem';
        row.appendChild(span);

        var input = document.createElement('input');
        input.type = 'datetime-local';
        input.id = 'endDate';
        input.style.color = 'var(--color)';
        input.style.fontSize = '1.15rem';
        input.style.marginLeft = '1rem';
        input.style.fontWeight = 'bold';
        row.appendChild(input);

        var row = document.createElement('div');
        row.className = 'row';
        row.style.marginTop = '1rem';
        row.style.width = '100%';
        row.style.justifyContent = 'space-between';
        col.appendChild(row);

        var button = document.createElement('button');
        button.className = 'button';
        button.innerHTML = 'Repartizeaza';
        button.type = 'button';
        button.onclick = function () {
            Dashboard.display(data.form);
            document.querySelector('#reserve').style.display = 'block';
        };
        row.appendChild(button);

        var button = document.createElement('button');
        button.className = 'button';
        button.innerHTML = 'Rezerva';
        button.type = 'button';
        button.id = 'reserve';
        button.onclick = function () { Dashboard.reserve(id); };
        button.style.display = 'none';
        row.appendChild(button);
    }

    static async display(data) {
        var room = document.querySelector('.room');
        room.innerHTML = '';

        var students = document.querySelector('#students').value;
        var freeSeats = document.querySelector('#freeSeats').value;

        data = JSON.parse(data);

        data.forEach((r) => {
            r.forEach((c) => {
                if (c != -1) {
                }
            });
        });
    }

}
