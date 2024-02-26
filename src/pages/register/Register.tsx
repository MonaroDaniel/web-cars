import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../../assets/logo.svg'
import Container from '../../components/container/Container'
import Input from '../../components/Input/Input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

const schema = z.object({
  name: z.string().min(1, 'O campo é obrigatório').min(6, 'A senha deve ter pelomenos 6 caracteres'),
  email: z.string().email('Insira um email válido').min(1, 'O campo email é obrigatório'),
  password: z.string().min(1, 'O campo senha é obrigatório')
})

type FormData = z.infer<typeof schema>

export default () => {
  const { handleInfoUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth)
    }
    handleLogout()
  }, [])

  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name
        })

        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid,
        })
        
        navigate('/dashboard', { replace: true })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  return (
    <Container>
      <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
        <Link to='/' className='mb-6 max-w-sm w-full'>
          <img
            className='w-full'
            src={logoImg}
            alt="Logo"
          />
        </Link>

        <form
          className='bg-white max-w-xl w-full rounded-lg p-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className='mb-3'>
            <Input
              type='text'
              placeholder='Digite seu nome completo...'
              name='name'
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <Input
              type='email'
              placeholder='Digite seu email...'
              name='email'
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <Input
              type='password'
              placeholder='Digite sua senha...'
              name='password'
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button
            type='submit'
            className='w-full bg-zinc-900 rounded-md text-white h-10 font-semibold'
          >
            Cadastrar
          </button>
        </form>

        <Link to='/login'>
          Já possuo uma conta? Faça o login!
        </Link>
      </div>
    </Container>
  )
}