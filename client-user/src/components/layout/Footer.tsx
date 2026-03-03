import {Separator} from '../ui/separator'
import Container from './Container'

const Footer = () => {
  return (
    <div className='w-full'>
      <Container>
        <Separator className='my-5' />
        <div className='flex justify-between gap-2'>
          <div className='space-y-1'>
            <div className='text-[#be4e47] text-2xl'>Hajime Nihongo</div>
            <div className='text-sm text-[#be4e47]'>Simplifying Japanese</div>
          </div>
          <div className='flex items-start gap-8 justify-end'>
            <ul className='space-y-2'>
              <li className='text-[#be4e47] font-bold cursor-default'>
                Company
              </li>
              <li className='cursor-pointer hover:text-red-500'>
                Testimonials
              </li>
              <li className='cursor-pointer hover:text-red-500'>About Us</li>
              <li className='cursor-pointer hover:text-red-500'>
                Acknowledgements
              </li>
            </ul>
            <ul className='space-y-2'>
              <li className='text-[#be4e47] font-bold cursor-default'>
                Japanese
              </li>
              <li className='cursor-pointer hover:text-red-500'>
                Hiragana & Katakana
              </li>
            </ul>
            <ul className='space-y-2'>
              <li className='text-[#be4e47] font-bold cursor-default'>
                Support
              </li>
              <li className='cursor-pointer hover:text-red-500'>Contact Us</li>
              <li className='cursor-pointer hover:text-red-500'>FAQ</li>
            </ul>
          </div>
        </div>
        <Separator className='my-5' />
        <p className='text-black mb-6'>
          © 2026, Hajime Nihongo.d Made with ❤️ from VietNam By Viet Tung.
        </p>
      </Container>
    </div>
  )
}

export default Footer
