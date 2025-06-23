const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;
const moment = require('moment');
const fs = require('fs');
const path = require('path');

class ExportUtils {
    // Generar Excel
    static async generarExcel(datos, nombreArchivo, tipoReporte) {
        console.log('Generando Excel para:', tipoReporte, 'con', datos?.length || 0, 'registros');

        const workbook = new ExcelJS.Workbook();
        const datosOrdenados = this.ordenarDatos(datos, tipoReporte);

        workbook.creator = 'El Patio de LEA';
        workbook.lastModifiedBy = 'El Patio de LEA';
        workbook.created = new Date();
        workbook.modified = new Date();

        switch (tipoReporte) {
            case 'clientes':
                await this.crearHojaClientes(workbook, datosOrdenados);
                break;
            case 'espacios':
                await this.crearHojaEspacios(workbook, datosOrdenados);
                break;
            case 'servicios':
                await this.crearHojaServicios(workbook, datosOrdenados);
                break;
            case 'reservas':
                await this.crearHojaReservas(workbook, datosOrdenados);
                break;
            case 'pagos':
                await this.crearHojaPagos(workbook, datosOrdenados);
                break;
        }

        return workbook;
    }

    // Generar PDF con logo y diseño mejorado
    static generarPDF(datos, tipoReporte) {
        console.log('Generando PDF para:', tipoReporte, 'con', datos?.length || 0, 'registros');

        try {
            const doc = new jsPDF();
            const datosOrdenados = this.ordenarDatos(datos, tipoReporte);

            // Configurar colores del tema "El Patio de LEA"
            const colors = {
                primary: [155, 89, 182],     // Morado del logo
                secondary: [52, 152, 219],   // Azul
                accent: [241, 196, 15],      // Amarillo del logo
                dark: [44, 62, 80],          // Gris oscuro
                light: [236, 240, 241],      // Gris claro
                success: [39, 174, 96],      // Verde
                warning: [230, 126, 34],     // Naranja
                white: [255, 255, 255],
                pink: [231, 76, 60],         // Rosa del logo
                cyan: [100, 207, 226]        // Celeste del logo
            };

            // Crear header con diseño y logo
            this.crearHeaderPDF(doc, colors, tipoReporte);

            // Agregar contenido según tipo
            let yPosition = 80;

            switch (tipoReporte) {
                case 'clientes':
                    yPosition = this.agregarTablaClientesPDFMejorado(doc, datosOrdenados, yPosition, colors);
                    break;
                case 'espacios':
                    yPosition = this.agregarTablaEspaciosPDFMejorado(doc, datosOrdenados, yPosition, colors);
                    break;
                case 'servicios':
                    yPosition = this.agregarTablaServiciosPDFMejorado(doc, datosOrdenados, yPosition, colors);
                    break;
                case 'reservas':
                    yPosition = this.agregarTablaReservasPDFMejorado(doc, datosOrdenados, yPosition, colors);
                    break;
                case 'pagos':
                    yPosition = this.agregarTablaPagosPDFMejorado(doc, datosOrdenados, yPosition, colors);
                    break;
                default:
                    console.log('Tipo de reporte no reconocido:', tipoReporte);
                    yPosition = this.agregarTablaGenericaPDF(doc, datosOrdenados, yPosition, colors);
                    break;
            }

            // Agregar footer
            this.crearFooterPDF(doc, colors);

            console.log('PDF generado exitosamente con logo');
            return doc;

        } catch (error) {
            console.error('Error generando PDF mejorado:', error);
            return this.generarPDFSimple(datos, tipoReporte);
        }
    }

    // Header con diseño profesional y logo real
    static crearHeaderPDF(doc, colors, tipoReporte) {
        try {
            const pageWidth = doc.internal.pageSize.width;

            // Fondo del header con gradiente simulado
            doc.setFillColor(...colors.primary);
            doc.rect(0, 0, pageWidth, 60, 'F');

            // Línea decorativa superior
            doc.setFillColor(...colors.accent);
            doc.rect(0, 60, pageWidth, 4, 'F');

            // Intentar cargar y agregar el logo real
            try {
                // Buscar en múltiples ubicaciones y formatos
                const posiblesPaths = [
                    path.join(__dirname, '../assets/logo.png'),
                    path.join(__dirname, '../assets/logo.jpg'),
                    path.join(__dirname, '../assets/logo.jpeg'),
                    path.join(__dirname, '../../cliente/src/assets/images/logo.png'),
                    path.join(__dirname, '../../cliente/src/assets/images/logo.jpg'),
                    path.join(__dirname, '../../cliente/src/assets/images/logo.jpeg')
                ];

                let logoEncontrado = false;

                for (const logoPath of posiblesPaths) {
                    console.log('Intentando cargar logo desde:', logoPath);

                    if (fs.existsSync(logoPath)) {
                        try {
                            const logoData = fs.readFileSync(logoPath);
                            const logoBase64 = logoData.toString('base64');

                            // Determinar formato
                            const extension = path.extname(logoPath).toLowerCase();
                            let formato = 'PNG';
                            if (extension === '.jpg' || extension === '.jpeg') {
                                formato = 'JPEG';
                            }

                            // Agregar logo al PDF
                            doc.addImage(`data:image/${formato.toLowerCase()};base64,${logoBase64}`, formato, 15, 10, 35, 35);
                            console.log('Logo cargado exitosamente desde:', logoPath);
                            logoEncontrado = true;
                            break;
                        } catch (logoError) {
                            console.log('Error al procesar logo en:', logoPath, '-', logoError.message);
                            continue;
                        }
                    }
                }

                if (!logoEncontrado) {
                    console.log('Logo no encontrado en ninguna ubicación, usando fallback');
                    this.crearLogoFallback(doc, colors);
                }
            } catch (logoError) {
                console.log('Error general cargando logo:', logoError.message);
                this.crearLogoFallback(doc, colors);
            }

            // Título principal
            doc.setTextColor(...colors.white);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('EL PATIO DE LEA', 60, 20);

            // Subtítulo con estilo
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('SALÓN DE EVENTOS', 60, 30);

            // Línea separadora
            doc.setDrawColor(...colors.accent);
            doc.setLineWidth(0.8);
            doc.line(60, 33, 150, 33);

            // Tipo de reporte con estilo
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`Reporte de ${this.getTituloReporte(tipoReporte)}`, 60, 42);

            // Fecha y hora
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 60, 50);

            // *** ELIMINÉ EL CÍRCULO ROJO CON "LEA" ***
            // Ya no hay elemento decorativo en la esquina derecha

        } catch (error) {
            console.error('Error creando header PDF:', error);
        }
    }

    // Logo de respaldo mejorado si no se puede cargar el real
    static crearLogoFallback(doc, colors) {
        // Círculo exterior morado
        doc.setFillColor(...colors.primary);
        doc.circle(32, 27, 20, 'F');

        // Castillo simplificado con los colores del tema
        // Torre principal (celeste)
        doc.setFillColor(...colors.cyan);
        doc.rect(27, 15, 10, 20, 'F');

        // Techo de la torre (morado)
        doc.setFillColor(...colors.primary);
        // Triángulo para el techo
        doc.setFillColor(...colors.primary);
        const towerTop = [
            [27, 15], [37, 15], [32, 8]
        ];
        doc.triangle(27, 15, 37, 15, 32, 8, 'F');

        // Bandera (amarilla)
        doc.setFillColor(...colors.accent);
        doc.rect(32, 8, 8, 4, 'F');

        // Ventana (blanca)
        doc.setFillColor(...colors.white);
        doc.rect(29, 18, 6, 8, 'F');

        // Torres laterales más pequeñas (amarillas)
        doc.setFillColor(...colors.accent);
        doc.rect(22, 20, 5, 15, 'F');
        doc.rect(37, 20, 5, 15, 'F');

        // Estrellas decorativas
        doc.setFillColor(...colors.accent);
        // Estrella izquierda
        doc.circle(18, 12, 2, 'F');
        // Estrella derecha  
        doc.circle(46, 12, 2, 'F');
    }

    // Footer con diseño mejorado
    static crearFooterPDF(doc, colors) {
        try {
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;

            // Fondo del footer
            doc.setFillColor(...colors.light);
            doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

            // Línea superior del footer con colores del tema
            doc.setFillColor(...colors.primary);
            doc.rect(0, pageHeight - 25, pageWidth, 3, 'F');

            // Texto del footer con estilo
            doc.setTextColor(...colors.dark);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');

            const footerText = '© 2025 El Patio de LEA - Salón de Eventos';
            const textWidth = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 15);

            // Información adicional
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            const infoText = 'Reporte generado automáticamente por el sistema de gestión';
            const infoWidth = doc.getTextWidth(infoText);
            doc.text(infoText, (pageWidth - infoWidth) / 2, pageHeight - 8);

            // Elementos decorativos en las esquinas (estrellas)
            doc.setFillColor(...colors.accent);
            // Estrella izquierda
            this.dibujarEstrella(doc, 15, pageHeight - 12, 3, colors.accent);
            // Estrella derecha
            this.dibujarEstrella(doc, pageWidth - 15, pageHeight - 12, 3, colors.accent);

        } catch (error) {
            console.error('Error creando footer PDF:', error);
        }
    }

    // Función auxiliar para dibujar estrella
    static dibujarEstrella(doc, x, y, size, color) {
        try {
            doc.setFillColor(...color);
            // Estrella simple como círculo con rayos
            doc.circle(x, y, size, 'F');
            // Rayos de la estrella
            doc.setLineWidth(1);
            doc.setDrawColor(...color);
            doc.line(x - size - 1, y, x + size + 1, y);
            doc.line(x, y - size - 1, x, y + size + 1);
        } catch (error) {
            console.error('Error dibujando estrella:', error);
        }
    }

    // Función auxiliar para títulos de sección
    static agregarTituloSeccion(doc, titulo, yPosition, colors) {
        try {
            doc.setFillColor(...colors.light);
            doc.rect(10, yPosition - 2, doc.internal.pageSize.width - 20, 10, 'F');

            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(titulo, 15, yPosition + 5);
        } catch (error) {
            console.error('Error agregando título de sección:', error);
        }
    }
    //funcion para ordenar datos
    static ordenarDatos(datos, tipoReporte) {
        if (!datos || !Array.isArray(datos) || datos.length === 0) {
            return datos;
        }

        try {
            const datosOrdenados = [...datos];

            switch (tipoReporte) {
                case 'clientes':
                case 'espacios':
                case 'servicios':
                    return datosOrdenados.sort((a, b) => {
                        const idA = parseInt(a.id) || 0;
                        const idB = parseInt(b.id) || 0;
                        return idA - idB;
                    });

                case 'reservas':
                    return datosOrdenados.sort((a, b) => {
                        const fechaA = new Date(a.fechaEvento || 0);
                        const fechaB = new Date(b.fechaEvento || 0);

                        if (fechaA.getTime() !== fechaB.getTime()) {
                            return fechaB.getTime() - fechaA.getTime();
                        }

                        const idA = parseInt(a.id) || 0;
                        const idB = parseInt(b.id) || 0;
                        return idA - idB;
                    });

                case 'pagos':
                    return datosOrdenados.sort((a, b) => {
                        const fechaA = new Date(a.fechaPago || 0);
                        const fechaB = new Date(b.fechaPago || 0);

                        if (fechaA.getTime() !== fechaB.getTime()) {
                            return fechaB.getTime() - fechaA.getTime();
                        }

                        const idA = parseInt(a.id) || 0;
                        const idB = parseInt(b.id) || 0;
                        return idA - idB;
                    });

                default:
                    return datosOrdenados.sort((a, b) => {
                        const idA = parseInt(a.id) || 0;
                        const idB = parseInt(b.id) || 0;
                        return idA - idB;
                    });
            }
        } catch (error) {
            console.error('Error ordenando datos:', error);
            return datos;
        }
    }
    // Tabla de clientes mejorada
    static agregarTablaClientesPDFMejorado(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos de clientes para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'INFORMACIÓN DE CLIENTES', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Nombre', 'RUT', 'Correo', 'Teléfono', 'Reservas'];
        const rows = datos.map(cliente => [
            cliente.id?.toString() || 'N/A',
            cliente.nombre || 'N/A',
            cliente.rut || 'N/A',
            cliente.correo || 'N/A',
            cliente.telefono || 'N/A',
            (cliente.total_reservas || 0).toString()
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: colors.dark,
                lineColor: colors.light,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: colors.primary,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 25 },
                3: { cellWidth: 45 },
                4: { cellWidth: 25 },
                5: { halign: 'center', cellWidth: 20 }
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    static agregarTablaEspaciosPDFMejorado(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos de espacios para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'ESPACIOS DISPONIBLES', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Nombre', 'Capacidad', 'Costo Base', 'Estado', 'Reservas'];
        const rows = datos.map(espacio => [
            espacio.id?.toString() || 'N/A',
            espacio.nombre || 'N/A',
            espacio.capacidadMaxima?.toString() || 'N/A',
            espacio.costoBase ? `$${Number(espacio.costoBase).toLocaleString()}` : 'N/A',
            espacio.disponible ? 'Disponible' : 'No Disponible',
            (espacio.reservasActuales || 0).toString()
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: colors.dark,
                lineColor: colors.light,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: colors.cyan,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 40 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'right', cellWidth: 30 },
                4: { halign: 'center', cellWidth: 30 },
                5: { halign: 'center', cellWidth: 25 }
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    static agregarTablaServiciosPDFMejorado(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos de servicios para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'SERVICIOS OFRECIDOS', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Nombre', 'Precio', 'Categoría', 'Estado'];
        const rows = datos.map(servicio => [
            servicio.id?.toString() || 'N/A',
            servicio.nombre || 'N/A',
            servicio.precio ? `$${Number(servicio.precio).toLocaleString()}` : 'N/A',
            servicio.categoria || 'N/A',
            servicio.disponible ? 'Disponible' : 'No Disponible'
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: colors.dark,
                lineColor: colors.light,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: colors.accent,
                textColor: colors.dark,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 50 },
                2: { halign: 'right', cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { halign: 'center', cellWidth: 35 }
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    static agregarTablaReservasPDFMejorado(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos de reservas para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'RESERVAS REGISTRADAS', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Cliente', 'Espacio', 'Fecha', 'Estado', 'Total'];
        const rows = datos.map(reserva => [
            reserva.id?.toString() || 'N/A',
            reserva.clienteNombre || 'N/A',
            reserva.espacioNombre || 'N/A',
            reserva.fechaEvento ? moment(reserva.fechaEvento).format('DD/MM/YYYY') : 'N/A',
            reserva.estado || 'N/A',
            reserva.costoTotal ? `$${Number(reserva.costoTotal).toLocaleString()}` : 'N/A'
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: colors.dark,
                lineColor: colors.light,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: colors.success,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 35 },
                3: { halign: 'center', cellWidth: 25 },
                4: { halign: 'center', cellWidth: 25 },
                5: { halign: 'right', cellWidth: 30 }
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    static agregarTablaPagosPDFMejorado(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos de pagos para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'HISTORIAL DE PAGOS', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Cliente', 'Monto', 'Método', 'Fecha'];
        const rows = datos.map(pago => [
            pago.id?.toString() || 'N/A',
            pago.clienteNombre || 'N/A',
            pago.monto ? `$${Number(pago.monto).toLocaleString()}` : 'N/A',
            pago.metodoPago || 'N/A',
            pago.fechaPago ? moment(pago.fechaPago).format('DD/MM/YYYY') : 'N/A'
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: colors.dark,
                lineColor: colors.light,
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: colors.warning,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 50 },
                2: { halign: 'right', cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { halign: 'center', cellWidth: 30 }
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    // Tabla genérica para casos no manejados
    static agregarTablaGenericaPDF(doc, datos, yPosition, colors) {
        if (!datos || datos.length === 0) {
            doc.setTextColor(...colors.dark);
            doc.setFontSize(12);
            doc.text('No hay datos para mostrar', 20, yPosition + 20);
            return yPosition + 40;
        }

        this.agregarTituloSeccion(doc, 'DATOS DEL REPORTE', yPosition, colors);
        yPosition += 15;

        const headers = ['ID', 'Información'];
        const rows = datos.map((item, index) => [
            (index + 1).toString(),
            JSON.stringify(item).substring(0, 50) + '...'
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPosition,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            margin: { left: 10, right: 10 }
        });

        return doc.lastAutoTable.finalY + 15;
    }

    // PDF simple de respaldo
    static generarPDFSimple(datos, tipoReporte) {
        console.log('Generando PDF simple de respaldo...');

        try {
            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text(`El Patio de LEA - Reporte de ${this.getTituloReporte(tipoReporte)}`, 20, 20);

            doc.setFontSize(10);
            doc.text(`Generado: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, 30);

            if (!datos || datos.length === 0) {
                doc.text('No hay datos disponibles para mostrar', 20, 50);
                return doc;
            }

            // Tabla simple
            let yPos = 50;
            const headers = this.getHeadersSimples(tipoReporte);
            const rows = this.getRowsSimples(datos, tipoReporte);

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: yPos,
                styles: { fontSize: 8 }
            });

            return doc;

        } catch (error) {
            console.error('Error en PDF simple de respaldo:', error);

            // PDF mínimo en caso de error total
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text('El Patio de LEA - Error al generar reporte', 20, 20);
            doc.setFontSize(10);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
            doc.text('Contacte al administrador del sistema', 20, 40);
            return doc;
        }
    }

    // Funciones auxiliares
    static getHeadersSimples(tipoReporte) {
        switch (tipoReporte) {
            case 'clientes': return ['ID', 'Nombre', 'RUT', 'Correo'];
            case 'espacios': return ['ID', 'Nombre', 'Capacidad', 'Costo'];
            case 'servicios': return ['ID', 'Nombre', 'Precio', 'Categoría'];
            case 'reservas': return ['ID', 'Cliente', 'Espacio', 'Fecha'];
            case 'pagos': return ['ID', 'Cliente', 'Monto', 'Fecha'];
            default: return ['ID', 'Información'];
        }
    }

    static getRowsSimples(datos, tipoReporte) {
        if (!datos || !Array.isArray(datos)) return [];

        return datos.map(item => {
            try {
                switch (tipoReporte) {
                    case 'clientes':
                        return [item.id, item.nombre || 'N/A', item.rut || 'N/A', item.correo || 'N/A'];
                    case 'espacios':
                        return [item.id, item.nombre || 'N/A', item.capacidadMaxima || 'N/A', item.costoBase || 'N/A'];
                    case 'servicios':
                        return [item.id, item.nombre || 'N/A', item.precio || 'N/A', item.categoria || 'N/A'];
                    case 'reservas':
                        return [item.id, item.clienteNombre || 'N/A', item.espacioNombre || 'N/A',
                        item.fechaEvento ? moment(item.fechaEvento).format('DD/MM/YYYY') : 'N/A'];
                    case 'pagos':
                        return [item.id, item.clienteNombre || 'N/A', item.monto || 'N/A',
                        item.fechaPago ? moment(item.fechaPago).format('DD/MM/YYYY') : 'N/A'];
                    default:
                        return [item.id || 'N/A', 'Datos disponibles'];
                }
            } catch (error) {
                console.error('Error procesando fila:', error);
                return ['Error', 'Error', 'Error', 'Error'];
            }
        });
    }

    static getTituloReporte(tipo) {
        const titulos = {
            'clientes': 'Clientes',
            'espacios': 'Espacios',
            'servicios': 'Servicios',
            'reservas': 'Reservas',
            'pagos': 'Pagos',
            'completo': 'Completo'
        };
        return titulos[tipo] || 'General';
    }

    // Funciones para crear hojas de Excel (mantén todas iguales)
    static async crearHojaClientes(workbook, datos) {
        const worksheet = workbook.addWorksheet('Clientes');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 25 },
            { header: 'RUT', key: 'rut', width: 15 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Total Reservas', key: 'total_reservas', width: 15 },
            { header: 'Última Reserva', key: 'ultima_reserva', width: 15 },
            { header: 'Fecha Creación', key: 'fecha_creacion', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF9B59B6' } // Morado del tema
        };

        datos.forEach(cliente => {
            worksheet.addRow({
                id: cliente.id,
                nombre: cliente.nombre,
                rut: cliente.rut,
                correo: cliente.correo,
                telefono: cliente.telefono,
                total_reservas: cliente.total_reservas || 0,
                ultima_reserva: cliente.ultima_reserva ? moment(cliente.ultima_reserva).format('DD/MM/YYYY') : 'N/A',
                fecha_creacion: moment(cliente.fecha_creacion).format('DD/MM/YYYY')
            });
        });
    }

    static async crearHojaEspacios(workbook, datos) {
        const worksheet = workbook.addWorksheet('Espacios');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 25 },
            { header: 'Capacidad Máxima', key: 'capacidadMaxima', width: 15 },
            { header: 'Costo Base', key: 'costoBase', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Disponible', key: 'disponible', width: 12 },
            { header: 'Reservas Actuales', key: 'reservasActuales', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF64CFE2' } // Celeste del tema
        };

        datos.forEach(espacio => {
            worksheet.addRow({
                id: espacio.id,
                nombre: espacio.nombre,
                capacidadMaxima: espacio.capacidadMaxima,
                costoBase: `$${espacio.costoBase.toLocaleString()}`,
                descripcion: espacio.descripcion,
                disponible: espacio.disponible ? 'Sí' : 'No',
                reservasActuales: espacio.reservasActuales || 0
            });
        });
    }

    static async crearHojaServicios(workbook, datos) {
        const worksheet = workbook.addWorksheet('Servicios');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 25 },
            { header: 'Precio', key: 'precio', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Categoría', key: 'categoria', width: 15 },
            { header: 'Disponible', key: 'disponible', width: 12 },
            { header: 'Proveedor Externo', key: 'proveedorExterno', width: 15 },
            { header: 'Reservas Activas', key: 'reservasActivas', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1C40F' } // Amarillo del tema
        };

        datos.forEach(servicio => {
            worksheet.addRow({
                id: servicio.id,
                nombre: servicio.nombre,
                precio: `$${servicio.precio.toLocaleString()}`,
                descripcion: servicio.descripcion,
                categoria: servicio.categoria,
                disponible: servicio.disponible ? 'Sí' : 'No',
                proveedorExterno: servicio.proveedorExterno ? 'Sí' : 'No',
                reservasActivas: servicio.reservasActivas || 0
            });
        });
    }

    static async crearHojaReservas(workbook, datos) {
        const worksheet = workbook.addWorksheet('Reservas');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Cliente', key: 'clienteNombre', width: 25 },
            { header: 'Espacio', key: 'espacioNombre', width: 25 },
            { header: 'Fecha Evento', key: 'fechaEvento', width: 15 },
            { header: 'Hora Inicio', key: 'horaInicio', width: 12 },
            { header: 'Personas', key: 'numeroPersonas', width: 10 },
            { header: 'Tipo Evento', key: 'tipoEvento', width: 20 },
            { header: 'Estado', key: 'estado', width: 12 },
            { header: 'Costo Total', key: 'costoTotal', width: 15 },
            { header: 'Total Pagado', key: 'totalPagado', width: 15 },
            { header: 'Saldo Pendiente', key: 'saldoPendiente', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF27AE60' } // Verde del tema
        };

        datos.forEach(reserva => {
            worksheet.addRow({
                id: reserva.id,
                clienteNombre: reserva.clienteNombre,
                espacioNombre: reserva.espacioNombre,
                fechaEvento: moment(reserva.fechaEvento).format('DD/MM/YYYY'),
                horaInicio: reserva.horaInicio,
                numeroPersonas: reserva.numeroPersonas,
                tipoEvento: reserva.tipoEvento,
                estado: reserva.estado,
                costoTotal: `$${reserva.costoTotal.toLocaleString()}`,
                totalPagado: `$${reserva.totalPagado.toLocaleString()}`,
                saldoPendiente: `$${reserva.saldoPendiente.toLocaleString()}`
            });
        });
    }

    static async crearHojaPagos(workbook, datos) {
        const worksheet = workbook.addWorksheet('Pagos');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Cliente', key: 'clienteNombre', width: 25 },
            { header: 'Espacio', key: 'espacioNombre', width: 25 },
            { header: 'Monto', key: 'monto', width: 15 },
            { header: 'Método Pago', key: 'metodoPago', width: 15 },
            { header: 'Fecha Pago', key: 'fechaPago', width: 15 },
            { header: 'Estado', key: 'estado', width: 12 },
            { header: 'Observaciones', key: 'observaciones', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE67E22' } // Naranja del tema
        };

        datos.forEach(pago => {
            worksheet.addRow({
                id: pago.id,
                clienteNombre: pago.clienteNombre,
                espacioNombre: pago.espacioNombre,
                monto: `$${pago.monto.toLocaleString()}`,
                metodoPago: pago.metodoPago,
                fechaPago: moment(pago.fechaPago).format('DD/MM/YYYY'),
                estado: pago.estado,
                observaciones: pago.observaciones
            });
        });
    }
}

module.exports = ExportUtils;