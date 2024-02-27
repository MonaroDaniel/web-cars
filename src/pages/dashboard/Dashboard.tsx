import { FiTrash2 } from "react-icons/fi"
import PanelHeader from "../../components/PanelHeader/PanelHeader"
import Container from "../../components/container/Container"
import { useContext, useEffect, useState } from "react"
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from "firebase/firestore"
import { db, storage } from "../../services/firebaseConnection"
import { CarsProps } from "../home/Home"
import { AuthContext } from "../../contexts/AuthContext"
import { deleteObject, ref } from "firebase/storage"

export default () => {
  const { user } = useContext(AuthContext)

  const [cars, setCars] = useState<CarsProps[]>([])

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return;
      }
      const carsRef = collection(db, 'cars')
      const queryRef = query(carsRef, where("uid", '==', user.uid))

      getDocs(queryRef)
        .then((snapshot) => {
          let listCars = [] as CarsProps[]
          snapshot.forEach(doc => {
            listCars.push({
              id: doc.id,
              name: doc.data().name,
              year: doc.data().year,
              km: doc.data().km,
              city: doc.data().city,
              price: doc.data().price,
              img: doc.data().images,
              uid: doc.data().uid
            })
          })
          setCars(listCars)
        })
    }

    loadCars()
  }, [user])

  async function handleDeleteCar(car: CarsProps) {
    const docRef = doc(db, 'cars', car.id)
    await deleteDoc(docRef)

    car.img.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`

      const imageRef = ref(storage, imagePath)

      try {
        await deleteObject(imageRef)
        setCars(cars.filter(value => value.id !== car.id))
      } catch (err) {
        console.log(err);
      }
    })
  }

  return (
    <Container>
      <PanelHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map(car => (
          <section key={car.id} className="w-full bg-white rounded-lg relative drop-shadow-lg [&>button:nth-child(1)]:hover:visible">
            <button
              onClick={() => handleDeleteCar(car)}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.464)' }}
              className="absolute w-14 h-14 invisible flex rounded-full items-center justify-center right-2 top-2 drop-shadow"
            >
              <FiTrash2 size={26} color="#000" />
            </button>
            <img
              className="w-full rounded-lg mb-2 max-h-70"
              src={car.img[0].url}
              alt={car.name}
            />
            <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                {car.year} | {car.km} KM
              </span>
              <strong className="text-black font-bold mt-4">
                R$ {car.price}
              </strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-black">{car.city}</span>
            </div>

          </section>
        ))}
      </main>

    </Container>
  )
}