-- Función para crear perfil de usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se crea un nuevo usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para crear perfil de desarrollador automáticamente para estudiantes
CREATE OR REPLACE FUNCTION public.create_developer_profile_for_student()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'student' THEN
    INSERT INTO public.developer_profiles (user_id, university, career, bio, available_for_collaboration, created_at, updated_at)
    VALUES (
      NEW.id,
      NULL,
      NULL,
      'Estudiante apasionado por la tecnología',
      FALSE,
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil de desarrollador automáticamente
CREATE TRIGGER on_user_created_create_dev_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_developer_profile_for_student();