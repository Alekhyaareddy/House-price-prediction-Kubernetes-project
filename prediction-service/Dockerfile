FROM python:3.11

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir --default-timeout=300 -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]