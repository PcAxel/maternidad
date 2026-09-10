-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS sistema_materno;
USE sistema_materno;

-- Tabla de pacientes
CREATE TABLE pacientes_paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad INT NOT NULL CHECK (edad BETWEEN 12 AND 60),
    direccion TEXT NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    email VARCHAR(254),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de antecedentes clínicos
CREATE TABLE pacientes_antecedenteclinico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT UNIQUE NOT NULL,
    controles_prenatales JSON DEFAULT NULL,
    numero_controles INT DEFAULT 0,
    numero_partos INT DEFAULT 0,
    numero_cesareas INT DEFAULT 0,
    numero_abortos INT DEFAULT 0,
    tiene_hipertension BOOLEAN DEFAULT FALSE,
    tiene_diabetes_gestacional BOOLEAN DEFAULT FALSE,
    tiene_preclampsia BOOLEAN DEFAULT FALSE,
    otras_patologias TEXT,
    grupo_sanguineo VARCHAR(3),
    observaciones TEXT,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes_paciente(id) ON DELETE CASCADE
);

-- Tabla de partos
CREATE TABLE partos_parto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_termino DATETIME,
    duracion_estimada INT DEFAULT 120,
    tiene_complicaciones BOOLEAN DEFAULT FALSE,
    complicaciones JSON DEFAULT NULL,
    matrona_id INT,
    medico_id INT,
    enfermero_id INT,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'EN_PROCESO',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes_paciente(id) ON DELETE CASCADE,
    FOREIGN KEY (matrona_id) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (medico_id) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (enfermero_id) REFERENCES auth_user(id) ON DELETE SET NULL
);

-- Tabla de complicaciones de parto
CREATE TABLE partos_complicacionparto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parto_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parto_id) REFERENCES partos_parto(id) ON DELETE CASCADE
);

-- Tabla de recién nacidos
CREATE TABLE recien_nacidos_reciennacido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parto_id INT NOT NULL,
    paciente_madre_id INT NOT NULL,
    codigo_qr VARCHAR(100) UNIQUE,
    numero_interno VARCHAR(20) UNIQUE NOT NULL,
    peso DECIMAL(5,2) NOT NULL CHECK (peso BETWEEN 0.5 AND 6.0),
    talla DECIMAL(5,2) NOT NULL CHECK (talla BETWEEN 30 AND 60),
    apgar_1 INT NOT NULL CHECK (apgar_1 BETWEEN 0 AND 10),
    apgar_5 INT NOT NULL CHECK (apgar_5 BETWEEN 0 AND 10),
    apgar_10 INT NOT NULL CHECK (apgar_10 BETWEEN 0 AND 10),
    condicion_al_nacer VARCHAR(20) NOT NULL,
    derivado BOOLEAN DEFAULT FALSE,
    servicio_derivacion VARCHAR(100),
    fecha_derivacion DATETIME,
    motivo_derivacion TEXT,
    estado VARCHAR(20) DEFAULT 'HOSPITALIZADO',
    fecha_nacimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parto_id) REFERENCES partos_parto(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_madre_id) REFERENCES pacientes_paciente(id) ON DELETE CASCADE
);

-- Tabla de controles posteriores del RN
CREATE TABLE recien_nacidos_controlposteriorrn (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recien_nacido_id INT NOT NULL,
    fecha_control DATETIME DEFAULT CURRENT_TIMESTAMP,
    vacuna_bcg BOOLEAN DEFAULT FALSE,
    fecha_bcg DATE,
    lote_bcg VARCHAR(50),
    vacuna_hepatitis_b BOOLEAN DEFAULT FALSE,
    fecha_hepatitis_b DATE,
    lote_hepatitis_b VARCHAR(50),
    tamizaje_neonatal BOOLEAN DEFAULT FALSE,
    fecha_tamizaje DATE,
    resultado_tamizaje VARCHAR(100),
    peso_actual DECIMAL(5,2),
    talla_actual DECIMAL(5,2),
    observaciones TEXT,
    responsable VARCHAR(100) NOT NULL,
    FOREIGN KEY (recien_nacido_id) REFERENCES recien_nacidos_reciennacido(id) ON DELETE CASCADE
);

-- Tabla de altas
CREATE TABLE altas_alta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    recien_nacido_id INT,
    alta_clinica_confirmada BOOLEAN DEFAULT FALSE,
    fecha_alta_clinica DATETIME,
    medico_responsable_id INT,
    alta_administrativa_confirmada BOOLEAN DEFAULT FALSE,
    fecha_alta_administrativa DATETIME,
    administrativo_responsable_id INT,
    certificado_generado BOOLEAN DEFAULT FALSE,
    certificado_pdf VARCHAR(255),
    fecha_certificado DATETIME,
    tipo_alta VARCHAR(10) NOT NULL,
    observaciones TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes_paciente(id) ON DELETE CASCADE,
    FOREIGN KEY (recien_nacido_id) REFERENCES recien_nacidos_reciennacido(id) ON DELETE SET NULL,
    FOREIGN KEY (medico_responsable_id) REFERENCES auth_user(id) ON DELETE SET NULL,
    FOREIGN KEY (administrativo_responsable_id) REFERENCES auth_user(id) ON DELETE SET NULL
);

-- Tabla de historial de altas
CREATE TABLE altas_historialalta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alta_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    detalles TEXT,
    FOREIGN KEY (alta_id) REFERENCES altas_alta(id) ON DELETE CASCADE
);

-- Tabla de perfiles de usuario
CREATE TABLE usuarios_perfilusuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL,
    telefono VARCHAR(15),
    especialidad VARCHAR(100),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES auth_user(id) ON DELETE CASCADE
);