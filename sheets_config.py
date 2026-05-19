"""
sheets_config.py — Configuración central de IDs de Google Sheets
Empresa: INGAMA

Para replicar este sistema a otra empresa:
  1. Copia este archivo
  2. Reemplaza los IDs con los de los Google Sheets de la nueva empresa
  3. No toques ningún otro archivo Python

Los IDs son los de hojas de cálculo públicas (modo solo lectura vía gviz/tq).
No son contraseñas ni credenciales — son el identificador de la URL de cada hoja.

Actualizado: 2026-05-19 — Datos extraídos del HTML del árbol de carpetas
              Raíz 1: FSSC_22000_Automatizacion (moronever21)
              Raíz 2: FSSC 22000 V.6 _IG_ AU-2026 (ingamacalidad)
"""

EMPRESA = "INGAMA"

# ═══════════════════════════════════════════════════════════════════════════════
# ── Raíces de Google Drive ────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

ROOT_FOLDERS: dict[str, str] = {
    "FSSC_22000_Automatizacion": "15PPBhTk86ptf3u0hJzr9TafKTIBbfeVP",  # moronever21
    "FSSC_22000_V6_IG_AU_2026":  "1oohYyUQZ9KmCkUnMAxFrtCQ6MpDnHqxg",  # ingamacalidad
}

# ═══════════════════════════════════════════════════════════════════════════════
# ── Raíz 1: FSSC_22000_Automatizacion (moronever21) ──────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

MORONEVER_ROOT_FILES: dict[str, str] = {
    "Control_FSSC_22000_v6_INGAMA":          "17mYcbQ3auHgD_LQyl5Oz37lQgC9rngpf_WfC4cSLz3A",
    "Detalle_Puntos_FSSC22000v6_INGAMA":     "1GtRTWvN-YdanZAbPRMQKevtM3fKto39wnrm9tbTZOew",
    "SGC_ISO_9001_2015_INGAMA":              "1NsTbzUwaPsDsHxkIfzfiDeQY2KwCPQ1L5T8seMqMXpE",
    "SGC_IS~2.xlsx":                         "1vKic3cdvwwzR8mcAqh37UFwDE_sTJcF8",
    "SGC_ISO_9001_2015.xlsx":                "1DNhmc2hUEtLvP3ZTRPABE1vKnr5ScGNU",
    "1. CONV. 01 - RG.xlsx":                 "1v0lcEFkRBkJKNPGSqFig1GjWV8OK-w8d",
}

# ── SISTEMA INGAMA 2026 Automatizacion ────────────────────────────────────────
SISTEMA_INGAMA_2026: dict[str, str] = {
    "folder":                           "1SXk76Q_xDzB08IxUJngYIzzVcoX-UkrA",
    "RESIDUOS_2026_Por_Area_y_Tipo":    "1yecBsxmC83mrffB-j1jQG3Csd5HODmL2z38q6BiRhig",
    "RESIDUOS_Por_Proceso_2024_2025":   "1nmkoUdnH0fv3mlMGHP6UfKRlNd61xLLi2OkF1OE8fKQ",
    "RESIDUOS_Y_DESPERDICIOS_Consolidado_v1": "17nMwoL5Rud8DN_qa3ZgcJY2Ieefgl4bf95k5xH8wo-I",
    "RESIDUOS_Y_DESPERDICIOS_Consolidado_v2": "1Ktyv62Jx7uIf_S4SWWDjPbOqVr5ZFxl-PyOqTenOM30",
}

DATOS_CALIDAD_FOLDER: str = "1xECzpQSo13WusVBzWH1h98iIlG2CofEe"

# ── Registros de Control de Calidad (RC.CC) ──────────────────────────────────
RC_CC_SHEETS: dict[str, str] = {
    "RC.CC.01":  "1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE",
    "RC.CC.1.1": "1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4",
    "RC.CC.02":  "180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU",
    "RC.CC.2.1": "1pS2egPZM_IuEFj33iyMkkXOkMt1uUJL0XrJz0pE1hNU",
    "RC.CC.04":  "1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g",
    "RC.CC.05":  "19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA",
    "RC.CC.06":  "1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI",
    "RC.CC.07":  "1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0",
    "RC.CC.08":  "1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM",
    "RC.CC.09":  "1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o",
    "RC.CC.10":  "1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU",
    "RC.CC.11":  "1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI",
    "RC.CC.13":  "1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0",
    "RC.CC.14":  "16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0",  # calidad
    "RC.CC.16":  "16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0",  # trazabilidad (misma hoja)
    "RC.CC.17":  "1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs",
    "Datos_Consolidados_PPRo": "1B53GrcJoYtvkIkzkt2VwqsEsXJGzKegfeoDp587SDSY",
}

DATOS_PRODUCCION_FOLDER: str = "1qPaZqAmweknmxPsaqNntfLe-0jSkc8QV"

# ── Registros de Producción (RC.PD) ──────────────────────────────────────────
RC_PD_SHEETS: dict[str, str] = {
    "RC.PD.01": "14E6s93GykPGqpVJH9f4gyKiXYV5yutpIvWOAFF7OmYg",
    "RC.PD.02": "1_aWiCwHrAx1bHpJ3twchTRwX0sCRtmwglVkPE7WrN04",
    "RC.PD.03": "1Ueb02r1KKiCSlsgr0DFm4LJNLSvHwMtpjsnMmLf82d8",
    "RC.PD.04": "1fOGAkJ1Yes7WDPusEEjbt71LBw6SP72bReHnCa44wKE",
    "RC.PD.05": "1l_WaU1PekIp_Cyk79jGhEGhtZkWJ0X6pOnupCnAhSQQ",
    "RC.PD.06": "17KcWzCQeIyGdsn9YNTjPNtqd7dq1kcB7aQVIGqXKyL8",
    "RC.PD.07": "1z7zUKc2-kS2BZA6e7Wakzuk0tgoBeV5_F8quvTu2qrA",
    "RC.PD.08": "1D9R19nsSb0bhqBgEWBCEbeDDdyOmpams8sLMhCAqdf4",
    "RC.PD.09": "1Ruel5WGlQtLjHIdXsX3LhV6bI3VaxiI4rk_C5qCNvlU",
    "RC.PD.10": "1IadQ8KERDI8rvKLBKervoSyaotP2Opdtu_n3FmgTJT4",
    "RC.PD.11": "1Ld8XA13BnSBYoJ6uMsQiptu7v_t4uKFdXwfBwtnFYaI",
    "RC.PD.12": "1W5eGAe2LOzIrQax_wLI386oZpDXQiAdp9rGgWxdqLQ4",
    "RC.PD.13": "1p9v0jkbcKgul_Ba40-2166b0vOucHh53U3qbp6aib0M",
    "I_Sistema_Ingreso_Datos_PRODUCCION":     "1AZ5QEcEPj0fblQkQa8NW9D9nN28iycNsQcB0NUmPxv4",
    "II_Sistema_Ingreso_Datos_PRODUCCION_II": "13g44WHLRnKxs5Jh16xg7Hexx0Ams2HvJETC7Xo9oMjk",
    "III_Sistema_Ingreso_Datos_PRODUCCION_III": "1LccaM8xfq8K5041wecRFamzO1zZNBUzro1Xpy3DDojA",
    "Sistema_Trazabilidad_2026":              "1l3hsYsWK8SH1oPDk0hmjgTu5V3HoRTv6WpCAZriW4Xg",
    "Anexo_26_Libro_Balance_Flujo_Cantidades": "14h5HE_GMBooqhWkzYjhfvNHxAQuvKv1M4sulR46_AqQ",
}

# ── Programas de Prerrequisitos (PPR) ─────────────────────────────────────────
PPR_FOLDER: str = "1r74tk50k6oAfewtiAjheFZx6i-uM2YDR"

PPR_FOLDERS_8_2_4: dict[str, str] = {
    "8.2.4_a_b_Infraestructuras":               "1CqMlL6QoA9wGanTfxMO4tuZ5Nm7o_aDC",
    "8.2.4_c_Servicios_Aire_Agua_Energia":      "1Lw-ijZ_-tX3ev-T1iDFbsrpP5mzjbmAv",
    "8.2.4_d_Servicios_Plagas_Residuos":        "1KC_7lW_0bVC50n_SO1tp2ja65GGhEJl8",
    "8.2.4_e_Idoneidad_Mantenimiento_Equipos":  "1n9ylyLGgUFhYKalgMgv_b6RESMAw8DMX",
    "8.2.4_f_Gestion_Proveedores":              "1u-4TuZshjuxdYpCzeEpQLOI68bN_HvnM",
    "8.2.4_g_Gestion_Materiales_Comprados":     "1UaVEp4FGgVTCDPAVJCjK8s7yMHOG_NzS",
    "8.2.4_h_Prevencion_Contaminacion_Cruzada": "1T6PNKk6TBl3cmxpguVMTzeEW7_xM_rfN",
    "8.2.4_i_Sanitizacion":                     "1mtlAM2ScbzRYjNUA3so7ltkkQSUAWfZJ",
    "8.2.4_j_Higiene_del_Personal":             "1RVvVPejRZSonvtkfLkFueuZq-diFXKYp",
    "8.2.4_k_Informacion_del_Producto":         "1s9RTgG0474_ig4K0VBWu_wFtih9kKBCw",
    "8.2.4_Otros_Aspectos":                     "1SGCMllVypdEb7EUtY3-BlG6BKA8VQAVs",
}

ELIMINACION_RESIDUOS_FOLDER: str = "1ZDNHBSh29Bnw7giJQhQhQYNl5X4o2QaB"

PPR_SHEETS: dict[str, str] = {
    "CONTROL_PLAGAS": "1Lrs4UFXJSEmTyuyGMwFMf78bpbjxvZNf",
    "LIMPIEZA_DESINFECCION": "19lKYweHbMm0hD_ADeTGFA6cDKnYH2a9kijJ6LFU1obI",
    "HIGIENE_PERSONAL": "1m7TWDl9dxK4betTK4n1667m-_QFD5m-VnbQR-18GbRg",
}

# ═══════════════════════════════════════════════════════════════════════════════
# ── Raíz 2: FSSC 22000 V.6 _IG_ AU-2026 (ingamacalidad) ─────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

IG_ROOT_FILES: dict[str, str] = {
    "CONTROL_DE_MPS.xlsx":                         "1faxHkmZq-a3aQQM2nh6B8TMwBAfqIKjj",
    "RC.HP.1-2-3-4-5_Analisis_HACCP_IG.xlsx":     "1U8ggsBTU4T0_CegPF4wlmly1oLVO59hU",
    "FORMATOS_INGAMA.xlsx":                        "1x_UeBAJDZRzKyM-lVTriVe7UwwlBlraG",
    "KARDEX_DE_ACOPIO_GENERAL_2025.xlsx":          "1C1i_vMizBQyxUsHRxfXRjvUDTUgulVDo",
    "solicitud_compra_2024.xlsx":                  "15zOIHzeZVMDiw8H3B79QWpTotQiILFbv",
    "ASISTENCIA_AUDITORIA_2024.xlsx":              "1iU-ZRO3-Z0RpfvCLJ1oYiHtrumboi1kn",
}

# ── 0. ORDEN_IG ──────────────────────────────────────────────────────────────
IG_0_ORDEN: dict[str, str] = {
    "folder":                                   "1E1XhQqAWj7Q-ThWZZ-eQ7EUKFhNRLOvD",
    "1.Orden_5s_IG.docx":                       "1XPK_6xsAn1-Kk0RP8xT6FTgLoqirufrI",
    "1.Orden_5s_IG.pdf":                        "1OX08S4nMw-DPxBen3bEYjCsRpdlRx4tm",
    "2.FSSC_22000_IG.pdf":                      "1rzOSYPp8eCxNvcwJo9Cs7zVtczPhwTt8",
    "3.Gestion_de_Documentos.pdf":              "1EH6MWe39nqEPOQEqf4mOb_MJO62FnHDh",
}

# ── 4. Contexto_IG ───────────────────────────────────────────────────────────
IG_4_CONTEXTO: dict[str, str] = {
    "folder":                                   "11djHej3bkKWoBq_L7tV4_-DfNZZsDqFg",
    "4.1_Contexto_Interno_y_Externo":            "152qcB4_OrSrIm1TmcqnEIt6R_2R86loV",
    "4.1_Analisis_FODA_IG_AU.xlsx":             "137VmRNLNZH57YTueCkTt3WxXBWfDwSFz",
    "4.2_Partes_Interesadas":                   "1uH8_jwFgFhGKRlmpvHiexNMQnhMMIkvx",
    "4.2_Analisis_Partes_Interesadas_IG_AU.xlsx": "1YA_n7RWEGElYgZ8Evx5eku831XYlgczd",
    "4.3_a_4.4_Alcance_del_SGIA":               "1lry8SIpQ0W0xk4NJHaPZapk5gBjtIacE",
    "MA.SG.01_Manual_del_SGIA_IG_AU.docx":      "1W27z96Mi5mMTx9KikBlvyEEOD7UDqZ_i",
}

# ── 5. Liderazgo_IG ──────────────────────────────────────────────────────────
IG_5_LIDERAZGO: dict[str, str] = {
    "folder":                                       "1nk3mYRZguusH0tv7Ad93kj7OfM6uHSq7",
    "Presupuesto_2025_INGAMA.xlsx":                  "1wWS9m25s9SAw6QyqhsnNrwTduHli_rPk",
    "5.1_Liderazgo_y_Compromiso_5.2_Politica":       "109CRosQF8yY_U0nhZ9bKvHC3xyE0EE0X",
    "PO.IC.1_Politica_IG_AU.docx":                   "1_LYPtrgmaitq88txU_cdzdgPDD3P1Pjl",
    "5.2_Politica_Objetivos_IG_AU.xlsx":             "18aDHMiLLmLp7i5IICwg2D3bgyPXzaG3q",
    "5.3_Roles_y_Responsabilidades_incl_7.1_y_7.2":  "1RWFDhHYJZlMt7wJMvRjHLcw1QnhixZXe",
    "5_OTROS":                                       "11wdYlSa0e5vHy5AinVZLxiP3oR4t23ie",
    "Registros_de_Capacitacion_IG_10-8-2024.xlsx":   "1fa9JaE_8g5MLEH-pSvXK-aJ3_u5pc_7i",
    "SENALETICA.pdf":                                "17DNLD05CxmDybWVjvVoY6pQIjVvTNqKM",
    "Plan_Capacitacion_IG_30-01-24.xlsx":            "1heq0NCxj8izkdeihsMp1jhU__9q51wyz",
    "Programa_Implementacion_SMETA.xlsx":            "1tfv2td0IZCZKjcTyZcupcerm-hIGxGZ7",
    "5.2_POLITICAS":                                 "1tK_0YLZ3DxAzKuQrBTaJSKDGDg1sRgAR",
    "Politica_IG_AU.docx":                           "1jYTFDa5WfrzQC_axushTeElH7lzWZwTo",
    "5.2_Politica_Vision_Mision_Valores_Objetivos_IG_AU.xlsx": "1rphMwcLdpHkDbNOAgacHkxpSVtkb22PN",
    "Doc_Antiguos_IG_subcarpeta":                    "12q2M7ahR6cdIUT2x8WAMVVmPh3XiNFYm",
    "5.3_Roles_y_Responsabilidades_IG":              "1sWf4zhN2ueSdJ2jtbxdANZPY6raGYtjB",
    "DESCRIPCION_DEL_CARGO.pdf":                     "1VVNuccYHhmRBFQTkizUwVavM6ZVg1gie",
    "MA.FU.01_Manual_de_Funciones_21-02-24.docx":    "1ykcseh9zllc1bOIEvGeHbOnJhN5Hj_8F",
    "RC.RH.01_Evaluacion_de_Competencia.xlsx":       "1LesObJRqQMA5RyLsvFmIzZO5a9Y_LJ3l",
    "Diccionario_de_Competencias_IG.pdf":            "1XzjOpzYhONlLc_N7JLaOJZLeWEWncy7m",
}

# ── 6. Planificación_IG ──────────────────────────────────────────────────────
IG_6_PLANIFICACION: dict[str, str] = {
    "folder":                                           "1AVcOoX8FdGSccZtiES9nM7NMY34NoauQ",
    "6.1_Riesgos_y_Oportunidades":                      "1BB_Jm9WsTrYVNQ7pEgYpkkbXfbsjnTcB",
    "PR.GR.01_Gestion_de_Riesgos_IG_AU.docx":           "1FTDClsgkOjFnVuWMJl07x5hocMJDRG4x",
    "RC.GR.01_Control_Evaluacion_Riesgos_FODA_IG_AU.xlsx": "1YwLGZ3Ig_Ms00Yw8I9P1uErv8n2va-Km",
    "RC.GR.02_Evaluacion_Riesgos_PIP_IG_AU.xlsx":       "1rLgSNGIgJ3i-BOnVjW4-wdB8spUUcS33",
    "RC.GR.03_Identificacion_Evaluacion_Riesgos_Procesos_IG_AU.xlsx": "173Bs8bzj2_N9Q2ehZ-VZ57IeESbR1pBF",
    "RC.GR.04_Evaluacion_Oportunidades_FODA_IG.xlsx":   "1BMymizXMjuKi15dys1OI50XmT_Bc_SYM",
    "RC.GR.05_Evaluacion_Oportunidades_PIP_IG_AU.xlsx": "1G8lNmJ5PcEDQNKjgNTor2dvI9YSity-p",
    "RC.GR.06_Evaluacion_Oportunidades_Proceso_IG_AU.xlsx": "1ltY-POHYVaOO8eRvSIlDc1hHAUIHiScT",
    "PL.GR.01_Accion_Oportunidades.xlsx":               "1eVacEXBiGev4N1t80xg5Ll6y6NB-Kshv",
    "PL.GR.02_Plan_de_Gestion_de_Riesgo_IG_AU.xlsx":    "1bGasClDU-3mB6XAkq8LAOfX2YSAmVH2X",
    "00_Procesos_Apoyo_Operacion_Estrategicos_IG_AU.xlsx": "1Sfais1oFhHZH0VEKksEo_lOW4sI9M-zO",
    "6.2_Objetivos_del_SGIA_Planificacion":             "1Q1Cfo_Cvk8NBaGfme26G_iY30fkssjwQ",
    "IT.GR.01_Analisis_y_valoracion_del_riesgo_IG_AU.docx": "104LhWdAnE8YhT9AfdEPB0kZIqal1Uxyx",
    "00_Procesos_Apoyo_Operacion_Estrategicos_v2.xlsx": "1ek6_xSYspv7Quf5SX8EY9L71h4bdo5tA",
    "6.3_Planificacion_de_Cambios":                     "1VUpyuCbT4LwN_jsTq87gzKIeOzMur19i",
    "PR.GC.01_Gestion_de_Cambios_IG_AU.docx":           "1CdlTbAsOzqs1wAbE6aGtj5ySB5PsfC-L",
    "RC.GC.01_Solicitud_de_Cambio.xls":                 "14MtdzI1Agupof9aDhdx27juWJWstZENm",
    "RC.GC.02_Gestion_de_Cambio.xls":                   "1LvjuFhJOfcHJN9hmsPqfT1jZMGA_k81V",
    "Registro_lleno_de_solicitud_subcarpeta":           "1K-lbokXJ7w10ScCYN6Vn4AYGgpJm3Ck0",
}

# ── 7. Apoyo_IG ──────────────────────────────────────────────────────────────
IG_7_APOYO: dict[str, str] = {
    "folder":                                           "1KumdqP3XZJtse5bahK9EXx1c9vAx1mPe",
    "7.1_Recursos":                                     "1S3oHjOBGaLbrvPWOzjZN53jR984V_u9U",
    "PR.RS.01_GESTION_DE_RECURSOS_IG_AU.docx":         "1EyuAvRU81cnfT2YRmGvMhXgHaBTmbpjg",
    "7.2_y_7.3_Competencia_Toma_de_Conciencia":         "1lT1FZqRGeBhFCmxEP2l5sUJHX327AoLT",
    "MANUAL_DE_FUNCIONES_2026_OK.docx":                "1hsuHuGz6LdleUouQ5FMzz3QB23Cys58M",
    "OGANIGRAMA_2026_ACTUALIZADO.xlsx":                "10akY4C5jb8_zh5J2nX0ljBGlq_dTQRxC",
    "ORGANIGRAMA_2026.xlsx":                           "1yWYdRNx0UU3tXtcJW8d5vROFQ-XUqAcB",
    "RC.CA_01_a_05_IG_AU_FORMATO.xlsx":               "1jZePoGQpd-utxW__NFJDfmklIgf_bIwG",
    "PL.CA.01_Plan_de_Capacitacion_2026.xlsx":         "16psaFzr59p5URIR7PXW8zDZzOrQjY0pJ",
    "RC.CA.06_PLANILLA_DE_ASISTENCIA_2026.xlsx":       "1Tg7XV3Ll7NFUP9ML1AcEvm2xiFRsxKg4",
    "ADENDA_DE_RESPONSABLES_DE_AREAS.xlsx":            "1GeuDzXxwMH5Weh0vsOy7pPPKp812MSdE",
    "PR.GP.01_Procedimiento_Gestion_de_Personal_IG_AU.docx": "1QKcWrX6gBGkY3cKYJ8Miu-kJ_61-lonv",
    "7.4_Comunicacion_IG":                              "1gRm11IAxL-84rFVnnc-PjjZ_OboN3oUM",
    "PR.CM.01_Procedimiento_de_Comunicacion_IG_AU.docx": "1Kf4wgAoe99bqcCYIyLkc2Y__l1w6KPoz",
    "RC.CM.01_al_05_Registros_Comunicacion_IG_AU.xlsx": "1v0F0OcLwa4XI8h83DnsHNcwHdijGpkpx",
    "PL.CM.01_02_Plan_de_Comunicacion_Int_y_Ext_IG_AU.xlsx": "124o9aOHFyNeNil1CJ-83UnIrwGKe8V_m",
    "Comunicacion_Actualizacion_Documentacion_2025.docx": "1m9Mx09CDn_AvrQfeDccuI5LDG9uUMIf8",
    "Carta_de_Comunicacion_Especificaciones_MP_2025-2026.docx": "1fyZJPiJHm2gc_UNC-y5dEifoGDTETbcX",
    "Comunicacion_de_Estatus_Certificaciones_IG-2026.docx": "1Iue5iBm1RIzS-F2AmZNJnFympt8gK2Jr",
    "7.5_Informacion_Documentada_IG":                   "1RJ4zzuR7Ygaazp4Cnjc18XXA0Ounq9cc",
    "PR.GD.01_Procedimiento_Gestion_de_Documentos_IG_AU_2026.docx": "1DN138U1CUhRWHOCCT98HJlp2GcE0SLC9",
    "RC.GD.01_Listado_Maestro_Documentos_Internos_IG_AU_2026.xlsx": "1SiIqWxrWiiE5ghxPcUoVKTSnORywEYAW",
    "RC.GD.02_a_RC.GD.5_Control_de_Documentos_IG_UA_2026.xlsx": "10Dw8EB4k7kp2lGDR7GM8doOivU1dt-gb",
    "RC.GD.5_Control_de_Cambio_Lleno.xlsx":             "12EAkbsKUTu1JaizCG5RkiZPPukvI-RLc",
    "RV.GD.01_Registro_Verificacion_Proc_Gestion_Documentos_IG.xlsx": "1NCKxLfXwawKxcSAa4-jV2Kt2uftI7muv",
    "RV.GD.08_Revision_Anual_de_Documentacion_del_SGIA.docx": "1wfUp59-lIFWbWF7re6ZH6gF_DhhfTEBS",
}

# ── 8. Operación_IG ──────────────────────────────────────────────────────────
IG_8_OPERACION: dict[str, str] = {
    "folder":                                       "12uL5V8KQA4bYDdW2JNLW9Q2-tuwFuGSg",
    "8.2_Programa_de_Prerrequisitos_IG":             "1H6T6BBqOkAPOzyazaov3-VpA9E5EhquO",
    "8.2.4_8.2.5_Construccion_y_Distribucion_del_Edificio": "1fnqeV1bBx3JKg6sZvJ9TyyY3wU5hM4bt",
    "8.2.6_Servicios_Aire_Agua_Energia":             "1_kn7sd36VQkxj3hKP76aXjsI6kUFMeYQ",
    "8.2.7_Eliminacion_de_Residuos":                 "1ryEhAkEryh7nP8FlFofBq8qE8O5SQtw_",
    "8.2.8_Equipos_Adecuados_Mantenimiento":         "1lEpEoGfPFlExOq6jUwn9FIUPaf38JUsC",
    "8.2.9_Gestion_de_Materiales_Comprados":         "1ljvGJ8ymmeNxK1qLOgNAiv8mjP5NlTBU",
    "8.2.10_Medidas_Contaminacion_Cruzada":          "1owQK1au3hMvbIUqvpiQO6ZOZl51Q4GzH",
    "8.2.11_Limpieza_y_Desinfeccion":                "1UhKEriQkPTig6mTvOEfkTBMUwauARM6i",
    "8.2.12_Plagas_IG":                              "100RsDoWRvnnFUR-qTKToKJMEAx1MlSRw",
    "8.2.13_Higiene_de_Personal_y_Servicios":        "1PzxRgk0G1LNLH0-2JXEorFxtRwX15a7P",
    "8.2.14_Reprocesamiento_IG":                     "1Cb3GLaBfkQgl-Stb1ySGEfrIs_-gcA7j",
    "8.2.15_Retiro_de_Productos":                    "1rMfE_-oGtay1WO-IsncC7bl6C78TIOaK",
    "8.2.16_Almacenamiento":                         "1wYo536xpY91ggU78c_95ErdMe9XPg4Yx",
    "8.2.17_Informacion_Producto_Sensibilizacion":   "1VTpgMzu0MOdLrC3i7AITtB4YpGxLZkdy",
    "8.2.18_Defensa_de_Alimentos_11.3":              "1yZzeINfxwlnwnCHA8yk2Rp0NHEE-zOYT",
    "8.5_A_8.8_HACCP_IG_AU":                        "1Bs1sZYq0y_iqpJHoMbKZ9aPAW_yOuRsL",
    "MA.HC.01_Manual_HACCP_IG.docx":                 "1t15wbPG3sGAAFeCiBdIfYKwIeDQ1A3mE",
    "PL.HC.1_Plan_HACCP_IG.xlsx":                    "1VjrsgzLTh9RrLsHHoI4VqH8gUWFtIl0g",
    "PL.HC.1_Plan_HACCP_IG.pdf":                     "1ylEhg1bl1S6CGRoT-Kfpbc4Rcmph5Pb8",
    "PL.HC.1_Plan_HACCP_IG_Matriz.pdf":              "1yOYtr67lqHewT0tl5K4YhnE54TDQyKki",
    "PL.HC.1_Plan_HACCP_IG_Arbol.pdf":               "1YhQ33yQqVO6fqZv1Ll9vfvPaGMKYTYCp",
    "RC.HC.01_Analisis_HACCP_IG_AU_EN_INGLES.xlsx":  "1jIfFJkBNOVQ4EPtTHmEyG6hXEZnBpljy",
    "RC.HC.02_Actas_Equipo_HACCP_2026.xlsx":         "1zPZFhWTcZiPBHZIGD9unJje9g_4efcNB",
    "RC.HC.02_Actas_Equipo_HACCP_IG.xlsx":           "1boDDLOzXGrTUPvkKbvrSqd4srjS9ARfK",
    "RV.HC.04_Verificacion_del_Sistema_HACCP_IG.xlsx": "1qNS15WK1dT9upebZkHk8GmrodEJlGOf-",
    "PL.HC.01_PCC_05_EN_INGLES.xlsx":                "1UltxatGOEhthONmUD3YHLD5p0Vs7-3zK",
    "REPORTE_DEL_LABORATORIO_LABCAR_2025.xlsx":      "10K9sWKNwEwsKyIlEC9KcwT5UIGQL4SYH",
    "Carta_de_Designacion_Equipo_HACCP_IG.docx":     "1kqG3KqnFsb56QMx29Ilyhbjb8XdU8VQK",
    "DT.HC_Informe_Comparacion_2025.docx":           "1wH4sekd4X5wApLjrdPQwTh9fbVEx5evd",
    "DT.HC.01_Validacion_PCC_01_Muerte_Microbiana.docx": "1zApfzLSo6eGzA3LKpyxhBNyrbnrf9b20",
    "DT.HC.02_Validacion_PCC_02_Control_de_Metales.docx": "1nFNBl5YtFQUIcSdAoHZpp5NW2jMVFy_L",
    "DT.HC.03_Validacion_PPR_Operativo_Aflatoxina.docx": "162a05IOrsMvwzquL1hyIuQXYREbbO3-j",
    "8.9_Control_de_No_Conformidades_del_Producto":  "1aw325Uh6khxtOOdcJosGCKIqA3yeJfKm",
    "8.9.1_Gestion_de_No_Conformidades":             "1QmBMeY2cN41ZAcDKGqt7mmjNExkwUAeg",
    "PR.NC.01_Gestion_de_No_Conformidades_IG_AU.docx": "17Kcn1RFWN9LN7oH6CAkrFj4aBIjj3aiR",
    "RC.NC.1-2_Registros_Producto_No_Conforme_IG_AU.xlsx": "1fYygiOApMje4cFcFFjvpXB0jnx4wY71H",
    "PN.NC.01_PLANO_DE_SEGREGACION.xlsx":            "1jZvc1rn0cHTsYwdnaU159aee5IbyN14Y",
    "RC.DA.10_Registro_Evaluacion_Eficacia_Plan_Defensa.xlsx": "1tet0iHuJdwqGasT99B0Bv88nQr-ltjaz",
    "FSSC_NO_CONFORMIDADES_CAR_Form_ESPANOL.docx":   "1OUfWM8R2SyEeeSQIvuU008BoeSCAIIHK",
    "8.9.2_a_8.9.3_Acciones_Correctivas":            "137a_M_OU5iIQvezPEh2g9vY4PNsl5isG",
    "8.9.4_Liberacion_Producto":                     "1GMWMOFlMbrZ1xzKQtPky7q5CntTYwHye",
    "8.9.5_Retirada_y_Recuperacion":                 "11vxnSR2Di79raIwXXkY4CXNLCn9Ahs5u",
}

# ── 9. Evaluación de Desempeño_IG ────────────────────────────────────────────
IG_9_EVALUACION_DESEMPENO: dict[str, str] = {
    "folder":                                                   "1iD_DqNrASeCgbP03FgPLDcZI3P8g02DO",
    "9.1_Evaluacion_Desempeno":                                 "1ZSZfCXA_rKWs7n39bPGdQEbZkaiywJ3g",
    "9.2_Auditorias_IG":                                        "1iQV2zJXPOf3EBFtxgqNaL5dJoAXiCBja",
    "PR.AU.Rev.01_Procedimiento_de_Auditorias_IG_AU.docx":     "12paL3gYfz2Jvwe3UvT8Z-FzdJTDahkRf",
    "PR.AU.Rev.02_Procedimiento_de_Auditorias_IG_AU.docx":     "1Qy1YEy4xlgz7a-pTU3aPTRGnSNif2xA9",
    "PG.AU.01_Programa_de_Auditoria_IG_AU.xlsx":               "1YnTLQPA57Mk_jmtQQBmcM2jhyWzl4B1S",
    "Plan_de_Auditoria_IG_AU.xlsx":                            "1svyww5tYmDN65Pjy5MW-gj4K3IUsrM-C",
    "RC.AU.01_Informe_de_Auditoria_2025.docx":                 "1HXZj0Q0kVxmwLP2QnEdAvpu5O9eFuRPl",
    "RC.AU.01_Informe_de_Auditoria_DENIS_AC.docx":             "1L_LlJm3BK0x-alrPUDYpDgIh4V0JdGXU",
    "RC.AU.02_Informe_No_Conformidades_y_Acciones_Correctivas.docx": "1ZpQNOnSZG7QTDfhNGzKqIq268aYn3TpI",
    "RC.AU.03_Evaluacion_Competencia_Auditores_IG_AU.docx":   "1yA0ekyfWNhkGnmbqzazfvOuK2MeAdj_p",
    "RC.AU.04_Evaluacion_Auditores_IG_AU.xlsx":               "11PdsJOZ31IBgiiU3PA54zJhm80fWX6B3",
    "RC.AU.05_APERTURA_Y_CIERRE_DE_AUDITORIA.xlsx":          "1nuUrJPqpFkDQSqNosa83UhtwAlG6zFj-",
    "RC.AI.02_INFORME_DE_NO_CONFORMIDADES_Y_AC.xlsx":        "1AahEqOjwVCAqAgiDD5eMxKAkZI6Lvan6",
    "Registros_Acciones_Correctivas_IG_AU_2025.xlsx":        "1l-eK9YTRsA8LljkKjuOFXaKbGJpSDFSm",
    "Registros_Acciones_Correctivas_IG_AU_2025_PCC.xlsx":    "1o0EAd0Ac6lPQlEbNp5LhGjnaQXd-zwua",
    "9.3_Revision_Por_la_Direccion":                            "1Qt6JC1u6zvEf4NEL-fcQDXFauAd-sRaG",
    "Informe_Revision_Por_la_Direccion_1er_Semestre_IG_AU.docx": "1bjPt2A1_yfjXS-iKcOHOFUEqiCQ56ihV",
    "Informe_Revision_Por_la_Direccion_2do_Semestre_IG_AU.docx": "1ZiPgE5wFhMfcToDHDBxADDs31Z7E42Ov",
    "RC.OB.01-02_Cuadro_Revision_Direccion_1er_Sem_2025.xlsx": "1zKLBRNRB0dzExbcMhZMS73iMvGA9j6yq",
    "RC.OB.01-02_Cuadro_Revision_Direccion_2do_Sem_2024.xlsx": "1jfjCy1_Xh0f4CgkgOGC7PbDY0-EHw0hn",
}

# ── 10. Mejora_IG ────────────────────────────────────────────────────────────
IG_10_MEJORA: dict[str, str] = {
    "folder":                                   "1RYyUv4vOI1gAIwIv02f5DML0IljfUkxl",
    "10.1_No_conformidades_y_acciones_correctivas": "1NRfhRR2aeBau6fpkeFlrE_P9dsQTfXFh",
}

# ── 11. Requisitos Adicionales_IG ────────────────────────────────────────────
IG_11_REQUISITOS_ADICIONALES: dict[str, str] = {
    "folder":                                   "1T_Xww8UOVXvylN_7CeLi1KqmVpMrY8OA",
    "11.1_Gestion_Servicios_y_Materiales_Comprados": "1z_0UsSB8a4iGUm6vcQ3Tg1bPHJN8jPeG",
    "11.2_Etiquetado_IG_AU":                    "1Jt8YNgEQ_R5RelW_kiSNw4ZlGpN4BkEo",
    "11.3_Defensa_de_Alimentos_8.2.18":         "1tVIFNcEMj1hY-Ye0jJVKuipYL4ugeEp7",
    "11.4_Fraude_IG_AU":                        "1-g7-azbk6v6KSAYvTEhZEzcyd7Gql6tY",
    "11.5_Uso_del_Logotipo":                    "1ZMvBoZX-LthdAVEExlVm7AuQfa9gv9ML",
    "11.6_Alergeno_IG_AU":                      "1R8LRLu0rNMMQr4Qie2Twmb3pnzNfF_Tb",
    "11.7_Monitoreo_Ambiental":                 "1wNsPssOcpt6mWid9YM-6hktplneyLhBz",
    "11.8_Cultura_IG_AU":                       "1y8AVdEl8DT-G19OTVu2RSqM2TmCPY0Jm",
    "11.9_Control_de_Calidad_Control_Operacional": "1VYK1POck1n7ekUkxBgkBwtQOqes_Myoq",
    "11.10_Transporte_Almacenamiento_Deposito": "1rN19lW9JrLlsg5_tv4TeHktzXVi3RcHU",
    "11.11_Control_de_Peligros_Contaminacion_Cruzada": "1ZSh-Wxq8QpbCKIyN_8bx-3i3M_FK9NPH",
    "11.12_Verificacion_PPRs":                  "1DLz5HEtqaPef_y9MXystO05AY8UofAhn",
    "11.13_Desarrollo_del_Producto":            "1TKiDqZnd9d2H2gTcOyJ7EUaF4qyYrVxo",
    "11.14_Supervision_Estado_de_Salud_Empleados": "1xmi1fNRb7LAyAEJHT6Q6MCrD-sxc43PI",
    "11.15_Gestion_de_Equipo_IG_AU":            "1VePzOmN3JtXlL7FavzFKovix2slAEYOf",
    "11.16_Perdida_de_Desperdicio":             "1gokY03Gcenr3CttTNqNpx7uumGZQwJbu",
    "11.17_Comunicacion_7.4":                   "1kCfxBuil9ouRUt0yFJXrZ_r-bdeZXqGo",
}

# ── 12. Manuales_IG ──────────────────────────────────────────────────────────
IG_12_MANUALES: dict[str, str] = {
    "folder":                               "1jKbQMlLQUIXBcy7VRy9N5Ig3BQq1zYEH",
    "MA.SG.01_Manual_del_SGIA_IG_AU.docx":  "12MNjFMBte1iFhA7lq4wOCQXJnsHPCDV8",
    "MA.FU.01_Manual_de_Funciones_IG_AU.docx": "14c0lpjapPFfMGYxQHulBtgjU3tAKjzXO",
    "MA.HC.01_Manual_HACCP_IG.docx":        "1pn43sScVYjricNdZ4OWrgYeexw5Z1Cdq",
    "MA.PR.01_Manual_de_Prerrequisitos_IG_AU.docx": "1w8Q-s2a6m0WIQ50YaLyRdUhexTKam5bw",
}

# ── CERTIFICADO DE CALIDAD_INGAMA_2024 ───────────────────────────────────────
IG_CERTIFICADOS: dict[str, str] = {
    "folder":                                           "1vIAjyIT_zNdIURhVT9UBIlkZLCQW1ZUh",
    "CLBO_000210_CertificateFSSCV6_ESPANOL.pdf":        "1TSluIXKfmeV7kNc_JWH5SD0q5RrI0dK5",
    "CLBO_000210_CertificateFSSCV6_Final_INGLES.pdf":   "1RVnLHvjcJAvfoGnEGQ0qinF_3RExDARi",
    "V2INGAMA-CLBO20105463-SUR1.2-Report_2025_Ingles.pdf": "1rfGLQaWMtbBv7UjWIlChLJPJQj2oCBBB",
    "V2INGAMA-CLBO20105463-SUR1.2-Report_FSSC_22000.pdf":  "1GePbNKmS-WniSaRC1tBZwWzzgM6cxKgL",
    "FODA_certificate-14045510900_2025.pdf":            "1UHbxcARXnqamgBiljUgPrUNFRIE41cj2",
    "RESENA_HISTORICA.pdf":                             "1VP8ifhaXZ8-SfywTjSQAcBl6JYHaSUHh",
}

# ── CONTRATO DE COMPRA DE MATERIA PRIMA-2026 ─────────────────────────────────
IG_CONTRATOS: dict[str, str] = {
    "folder":                                   "1GFqVSdNTJoQR6stNkwwThaDrh0kDCSUi",
    "Contrato_de_compra_MP-AARENARMAPA.docx":   "1MAxZtKZqS_pOHrwcuzM5aOH-qrrADi1f",
    "Contrato_de_compra_MP-B_SAN_IGNACIO.docx": "1FLj8wL9YpqTcbIr88_g7-09OQTid6E_M",
    "Contrato_de_compra_MP-DENNIS_AZUCARERA.docx": "1CqD4esFw9xASut9gY4VtjezW5ADAs4LT",
    "Contrato_de_compra_MP-SERNAP.docx":        "17ZsF_HS6tF8AcLdN6HTvKiQgh9chfgTd",
    "Contrato_de_compra_MP_RUDDY_ENDARA.docx":  "1lZc2sVIPgzUPburU4C1g2q0mCBRU1SdR",
    "Contrato_de_compra_MP_RICARDO_GAMARRA.docx": "19ZrBdV8t7S5hQuOUBZf7PtsODeJYhuVm",
    "Contrato_sin_logo_subcarpeta":             "1UWaNCz9RPTTC3vVkjywXMLTxYjw1Pmcn",
}

# ── Otros folders IG ─────────────────────────────────────────────────────────
IG_OTROS: dict[str, str] = {
    "ESPECIFICACIONES_DE_CLIENTES":             "1dNQKdU7cTcNk4hBp5pvvkOHQJPCm4F5J",
    "PDF_DE_CALIBRACION_DE_EQUIPOS_IG_AU":     "1P61kaZLsu7snVjbO33u-iKB28jWgrgDK",
    "REGISTRO_DE_PLASTICO-VIDRIO-CERAMICA_01_IG_AU": "19OBngFSWC9bkwWkuKxq8FghLb_PHiKBP",
    "TANIA_2024":                               "1yJQAyHCu9jfoUQ2HHVfIYs2eNXyWzfgP",
}

# ═══════════════════════════════════════════════════════════════════════════════
# ── Índice plano de búsqueda (name → id) ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════
# Para búsqueda rápida: ALL_SHEETS[name] → id
ALL_SHEETS: dict[str, str] = {}
ALL_SHEETS.update(ROOT_FOLDERS)
ALL_SHEETS.update(MORONEVER_ROOT_FILES)
ALL_SHEETS.update(SISTEMA_INGAMA_2026)
ALL_SHEETS.update(RC_CC_SHEETS)
ALL_SHEETS.update(RC_PD_SHEETS)
ALL_SHEETS.update(PPR_SHEETS)
ALL_SHEETS.update(PPR_FOLDERS_8_2_4)
ALL_SHEETS.update(IG_ROOT_FILES)
ALL_SHEETS.update(IG_0_ORDEN)
ALL_SHEETS.update(IG_4_CONTEXTO)
ALL_SHEETS.update(IG_5_LIDERAZGO)
ALL_SHEETS.update(IG_6_PLANIFICACION)
ALL_SHEETS.update(IG_7_APOYO)
ALL_SHEETS.update(IG_8_OPERACION)
ALL_SHEETS.update(IG_9_EVALUACION_DESEMPENO)
ALL_SHEETS.update(IG_10_MEJORA)
ALL_SHEETS.update(IG_11_REQUISITOS_ADICIONALES)
ALL_SHEETS.update(IG_12_MANUALES)
ALL_SHEETS.update(IG_CERTIFICADOS)
ALL_SHEETS.update(IG_CONTRATOS)
ALL_SHEETS.update(IG_OTROS)
