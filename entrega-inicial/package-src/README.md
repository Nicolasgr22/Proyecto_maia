## Modelo

![Python 3.10.19](https://img.shields.io/badge/python-3.10.19-blue.svg)
![tox](https://img.shields.io/badge/tox-tested-brightgreen.svg)

El desarrollo del modelo siguió la estructura propuesta durante el semestre, implementando un pipeline para el entrenamiento y almacenamiento automático del mejor modelo obtenido.

Durante el proceso, se identificó que no todos los features eran necesarios para el frontend, por lo que se optimizó el modelo reduciendo el número de estimadores. Para más detalles, consulte el archivo `config.yml`.

### Pasos para entrenar y empaquetar el modelo

1. Entrene el modelo ejecutando:
    ```bash
    tox run -e train
    ```
2. Una vez entrenado, genere el paquete:
    ```bash
    tox run -e test_package
    ```
3. Con todas las pruebas superadas, instale la herramienta de construcción:
    ```bash
    python3 -m pip install --upgrade build
    ```
4. Construya el paquete con:
    ```bash
    python3 -m build
    ```

El paquete generado debe ser colocado en la carpeta de la API para su despliegue.