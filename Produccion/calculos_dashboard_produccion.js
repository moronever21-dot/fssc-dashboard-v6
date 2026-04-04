window.CALCULOS_DASHBOARD_PRODUCCION = {
  "version": "2026-04-03-modulos",
  "estado": "operativo-por-lote",
  "origen": "produccion_aggregates_generated.json",
  "lotes_disponibles": [
    "AA 01-26",
    "AA 02-26",
    "BSI 01",
    "DA 01-CV",
    "RG 01-CV",
    "RG 02-CV"
  ],
  "modulos": [
    {
      "nombre": "Modulo de Rendimiento (Masa y Dinero)",
      "kpis": [
        {
          "nombre": "Rendimiento de Pre-Limpieza",
          "formula": "(Kg Salida RC.PD.03 / Kg Entrada RC.PD.02) * 100",
          "visualizacion": "Gauge"
        },
        {
          "nombre": "Rendimiento Final por Lote",
          "formula": "(Kg Sellados RC.PD.11 / Kg Entrada RC.PD.02) * 100",
          "visualizacion": "Scorecard"
        },
        {
          "nombre": "Cascada de Merma Total",
          "formula": "PD.02 inicio, PD.05 merma cilindros, PD.09 merma horno, PD.11 final",
          "visualizacion": "Waterfall"
        }
      ]
    },
    {
      "nombre": "Modulo de Calidad e Inocuidad (Seguridad Alimentaria)",
      "kpis": [
        {
          "nombre": "Control de Humedad Critica (PCC)",
          "formula": "Humedad RC.PD.07 <= 10%",
          "visualizacion": "Linea con alerta roja"
        },
        {
          "nombre": "Indice de Dano por Corte",
          "formula": "Promedio % Corte RC.PD.08 por lote",
          "visualizacion": "Barras, alerta > 5%"
        },
        {
          "nombre": "Estabilidad de Temperatura de Secado",
          "formula": "Temperatura RC.PD.09 alrededor de 75C",
          "visualizacion": "Control Chart"
        }
      ]
    },
    {
      "nombre": "Modulo de Clasificacion y Despacho (Comercial)",
      "kpis": [
        {
          "nombre": "Mix de Calidades",
          "formula": "Medium/Midget/Tiny de RC.PD.11",
          "visualizacion": "Pie Chart"
        },
        {
          "nombre": "Conciliacion Almacen vs Carga",
          "formula": "Stock Inicial RC.PD.12 - Carga RC.PD.13",
          "visualizacion": "Tabla de Alertas"
        }
      ]
    }
  ],
  "por_lote": {
    "AA 01-26": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 801.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 2.64,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 12600.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 0.0,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 0.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 0.0,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 46.5,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 15.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -14.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 137.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": null,
          "fuente": ""
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.33,
        "rendimiento_final_lote_pct": 0.03,
        "pcc_humedad_estado": "VERDE",
        "indice_dano_corte_pct": 46.5,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": null
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 801.0,
        "menos_merma_cilindros_pd05_kg": -12600.0,
        "menos_merma_horno_pd09_kg": -0.0,
        "final_pd11_kg": 0.21
      }
    },
    "AA 02-26": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 839.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 3.12,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 9257.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 0.0,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 0.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 0.0,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 21.0,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 41.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -14.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 153.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": 900.0,
          "fuente": "REGISTRO CONOCIMIENTO DE CARGA"
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.37,
        "rendimiento_final_lote_pct": 0.02,
        "pcc_humedad_estado": "VERDE",
        "indice_dano_corte_pct": 21.0,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": -747.0
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 839.0,
        "menos_merma_cilindros_pd05_kg": -9257.0,
        "menos_merma_horno_pd09_kg": -0.0,
        "final_pd11_kg": 0.21
      }
    },
    "BSI 01": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 791.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 5.46,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 8501.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 0.0,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 5.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 0.0,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 48.0,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 51.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -14.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 89.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": null,
          "fuente": ""
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.69,
        "rendimiento_final_lote_pct": 0.03,
        "pcc_humedad_estado": "VERDE",
        "indice_dano_corte_pct": 48.0,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": null
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 791.0,
        "menos_merma_cilindros_pd05_kg": -8501.0,
        "menos_merma_horno_pd09_kg": -0.0,
        "final_pd11_kg": 0.21
      }
    },
    "DA 01-CV": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 840.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 5.52,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 9170.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 0.0,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 0.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 0.0,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 51.5,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 17.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -14.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 148.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": null,
          "fuente": ""
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.66,
        "rendimiento_final_lote_pct": 0.02,
        "pcc_humedad_estado": "VERDE",
        "indice_dano_corte_pct": 51.5,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": null
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 840.0,
        "menos_merma_cilindros_pd05_kg": -9170.0,
        "menos_merma_horno_pd09_kg": -0.0,
        "final_pd11_kg": 0.21
      }
    },
    "RG 01-CV": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 812.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 4.86,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 6410.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 11.83,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 0.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 11.82,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 49.2,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 18.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -13.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 32.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": 800.0,
          "fuente": "REGISTRO CONOCIMIENTO DE CARGA"
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.6,
        "rendimiento_final_lote_pct": 0.03,
        "pcc_humedad_estado": "VERDE",
        "indice_dano_corte_pct": 49.2,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": -768.0
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 812.0,
        "menos_merma_cilindros_pd05_kg": -6410.0,
        "menos_merma_horno_pd09_kg": -11.83,
        "final_pd11_kg": 0.21
      }
    },
    "RG 02-CV": {
      "inputs": {
        "kg_entrada_pd02": {
          "valor": 830.0,
          "fuente": "Columna 8"
        },
        "kg_salida_pd03": {
          "valor": 5.46,
          "fuente": "REGISTRO PRE - LIMPIEZA Y CLASIFICADO"
        },
        "kg_sellados_pd11": {
          "valor": 0.21,
          "fuente": "REGISTRO CONTROL DE SELLADO"
        },
        "merma_cilindros_pd05_kg": {
          "valor": 10802.0,
          "fuente": "MERMA Kg"
        },
        "merma_horno_pd09_kg": {
          "valor": 0.0,
          "fuente": "Columna 9"
        },
        "humedad_pd07_pct": {
          "valor": 28.0,
          "fuente": "Columna 29"
        },
        "temperatura_pd09_c": {
          "valor": 0.0,
          "fuente": "75 °C 75 - 80 °C FT"
        },
        "corte_pd08_pct": {
          "valor": 50.4,
          "fuente": "Columna 12"
        },
        "medium_pd11": {
          "valor": 30.0,
          "fuente": "Columna 10"
        },
        "midget_pd11": {
          "valor": 0.21,
          "fuente": "Columna 11"
        },
        "tiny_pd11": {
          "valor": -14.0,
          "fuente": "Columna 12"
        },
        "stock_pd12": {
          "valor": 61.0,
          "fuente": "Columna 21"
        },
        "carga_pd13": {
          "valor": null,
          "fuente": ""
        }
      },
      "kpis": {
        "rendimiento_pre_limpieza_pct": 0.66,
        "rendimiento_final_lote_pct": 0.02,
        "pcc_humedad_estado": "ROJO",
        "indice_dano_corte_pct": 50.4,
        "indice_dano_corte_alerta": "ROJO",
        "estabilidad_temperatura_estado": "VERDE",
        "conciliacion_almacen_carga_delta": null
      },
      "waterfall_mermas": {
        "inicio_pd02_kg": 830.0,
        "menos_merma_cilindros_pd05_kg": -10802.0,
        "menos_merma_horno_pd09_kg": -0.0,
        "final_pd11_kg": 0.21
      }
    }
  },
  "nota": "Al elegir un lote (RG 01-CV, BSI 01, etc.), el dashboard debe leer esta seccion por_lote[lote] y mostrar los KPIs y graficos correspondientes."
};