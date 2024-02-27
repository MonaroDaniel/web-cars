import { ChangeEvent, useContext, useState } from "react"
import { FiTrash, FiUpload } from "react-icons/fi"
import PanelHeader from "../../../components/PanelHeader/PanelHeader"
import Container from "../../../components/container/Container"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../../../components/Input/Input"
import { AuthContext } from "../../../contexts/AuthContext"
import { v4 as uuidV4 } from 'uuid'
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { db, storage } from "../../../services/firebaseConnection"
import { addDoc, collection } from "firebase/firestore"
import toast from "react-hot-toast"

const schema = z.object({
  name: z.string().min(1, 'O campo nome é obrigatório'),
  model: z.string().min(1, 'O campo modelo é obrigatório'),
  year: z.string().min(1, 'O ano do carro é obrigatório'),
  km: z.string().min(1, 'O KM do carro é obrigatório'),
  price: z.string().min(1, 'O preço é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  whatsapp: z.string().min(1, 'O telefone é obrigatório').refine((value) => /^(\d{11,12})$/.test(value), {
    message: 'Número de telefone inválido'
  }),
  description: z.string().min(1, 'A descrição é obrigatória')
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export default () => {
  const { user } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const [carImages, setCarImages] = useState<ImageItemProps[]>([])

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0]

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        await handleUpload(image)
      } else {
        alert('Envie uma imagem JPEG ou PNG!')
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }
    const currentUid = user?.uid
    const uidImage = uuidV4()

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          const imageItem: ImageItemProps = {
            name: uidImage,
            uid: currentUid,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl
          }
          setCarImages((images) => [...images, imageItem])
          toast.success('Imagem cadastrada com sucesso!')
        })
      })
  }

  function onSubmit(data: FormData) {
    if (carImages.length <= 0) {
      toast.error('Envie alguma imagem deste carro!')
      return;
    }

    const carListImages = carImages.map(car => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })

    addDoc(collection(db, 'cars'), {
      name: data.name.toLocaleUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    })
      .then(() => {
        toast.success('Carro cadastrado com sucesso!')
        reset()
        setCarImages([])
      })
      .catch(error => {
        console.log(error);
      })
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`

    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== item.url))
    } catch (err) {
      console.log(err);
    }
  }

  function clickInputImg() {
    //Garante o click no input que abre os documentos para selecionar um arquivo
    const fileInput = document.getElementById('fileInput');
    fileInput?.click()
  }

  return (
    <Container>
      <PanelHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button onClick={clickInputImg} className="relative border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              onChange={handleFile}
              className="opacity-0 cursor-pointer"
              id="fileInput"
              type="file"
              accept="image/*"
            />
          </div>
        </button>

        {carImages.map(item => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative [&>button:nth-child(1)]:hover:visible">
            <button
              style={{backgroundColor: 'rgba(255, 255, 255, 0.464)'}}
              className="flex items-center justify-center absolute invisible h-14 w-14 rounded-full"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#FFF" />
            </button>
            <img
              className="rounded-lg w-full h-32 object-cover"
              src={item.previewUrl}
              alt='Foto do carro'
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <p className="mb-2 font-semibold">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-semibold">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Plus Manual..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-semibold">Ano do carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2016"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-semibold">KM rodados</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900..."
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-semibold">Telefone / Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 01199829926"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-semibold">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: São Paulo - SP"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-semibold">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 68.00..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-semibold">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register('description')}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white font-semibold h-10"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}