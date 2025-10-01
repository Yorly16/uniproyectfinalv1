import type { Project } from "./types"

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Sistema de Reconocimiento Facial para Seguridad",
    description:
      "Implementación de un sistema de IA que utiliza redes neuronales convolucionales para identificar personas en tiempo real, mejorando la seguridad en campus universitarios.",
    category: "Inteligencia Artificial",
    tags: ["Machine Learning", "Computer Vision", "Python", "TensorFlow"],
    authors: [
      {
        name: "María González",
        university: "Universidad Nacional",
        email: "maria.gonzalez@example.com",
      },
      {
        name: "Carlos Ramírez",
        university: "Universidad Nacional",
        email: "carlos.ramirez@example.com",
      },
    ],
    contact: "maria.gonzalez@example.com",
    estimatedCost: 15000,
    imageUrl: "/facial-recognition-ai-system-dashboard.jpg",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "Plataforma de Apoyo Comunitario",
    description:
      "Red social diseñada para conectar voluntarios con organizaciones sin fines de lucro, facilitando la colaboración en proyectos sociales y comunitarios.",
    category: "Social",
    tags: ["Desarrollo Social", "Voluntariado", "React", "Node.js"],
    authors: [
      {
        name: "Ana Martínez",
        university: "Universidad Autónoma",
        email: "ana.martinez@example.com",
      },
    ],
    contact: "ana.martinez@example.com",
    estimatedCost: 8000,
    imageUrl: "/community-support-platform-volunteers.jpg",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "3",
    name: "Sistema IoT para Agricultura Inteligente",
    description:
      "Solución tecnológica que integra sensores IoT para monitorear condiciones del suelo, humedad y temperatura, optimizando el riego y aumentando la productividad agrícola.",
    category: "Tecnológico",
    tags: ["IoT", "Arduino", "Sensores", "Agricultura"],
    authors: [
      {
        name: "Luis Fernández",
        university: "Instituto Tecnológico",
        email: "luis.fernandez@example.com",
      },
      {
        name: "Patricia Ruiz",
        university: "Instituto Tecnológico",
        email: "patricia.ruiz@example.com",
      },
    ],
    contact: "luis.fernandez@example.com",
    estimatedCost: 12000,
    imageUrl: "/smart-agriculture-iot-sensors-farm.jpg",
    createdAt: new Date("2024-03-08"),
  },
  {
    id: "4",
    name: "Diseño de Vivienda Sostenible Modular",
    description:
      "Propuesta arquitectónica de viviendas modulares construidas con materiales reciclados y diseño bioclimático, reduciendo el impacto ambiental y costos de construcción.",
    category: "Construcción/Arquitectura",
    tags: ["Arquitectura Sostenible", "Diseño Modular", "Ecología"],
    authors: [
      {
        name: "Roberto Silva",
        university: "Universidad de Arquitectura",
        email: "roberto.silva@example.com",
      },
    ],
    contact: "roberto.silva@example.com",
    estimatedCost: 45000,
    imageUrl: "/sustainable-modular-housing-architecture.jpg",
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "5",
    name: "Chatbot Educativo con IA Generativa",
    description:
      "Asistente virtual basado en modelos de lenguaje que ayuda a estudiantes con dudas académicas, proporcionando explicaciones personalizadas y recursos de aprendizaje.",
    category: "Inteligencia Artificial",
    tags: ["NLP", "GPT", "Educación", "Chatbot"],
    authors: [
      {
        name: "Diana López",
        university: "Universidad Politécnica",
        email: "diana.lopez@example.com",
      },
    ],
    contact: "diana.lopez@example.com",
    estimatedCost: 10000,
    imageUrl: "/educational-ai-chatbot-student-learning.jpg",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "6",
    name: "App Móvil para Reciclaje Urbano",
    description:
      "Aplicación que gamifica el reciclaje, permitiendo a usuarios registrar sus actividades de reciclaje, ganar puntos y canjearlos por recompensas en comercios locales.",
    category: "Social",
    tags: ["Medio Ambiente", "Mobile App", "Gamificación"],
    authors: [
      {
        name: "Jorge Mendoza",
        university: "Universidad Central",
        email: "jorge.mendoza@example.com",
      },
      {
        name: "Sofía Torres",
        university: "Universidad Central",
        email: "sofia.torres@example.com",
      },
    ],
    contact: "jorge.mendoza@example.com",
    estimatedCost: 9000,
    imageUrl: "/recycling-mobile-app-urban-sustainability.jpg",
    createdAt: new Date("2024-02-28"),
  },
]
